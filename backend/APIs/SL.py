#!/usr/bin/env python3
# -*- coding: utf-8 -*-
#
# Python 3
# Helmer Nylén 2017
# 
# Updated 2018-03-24
# - Skip the update instead of crash completely when receiving non-ok responses

import json
import os
import traceback
import datetime
import time
from urllib.request import urlopen, HTTPError

# Read config file
with open('config.json', encoding="utf-8") as config_file:
    config = json.load(config_file)

# Logging to file and optionally console
logarray = []
def log(obj):
    logarray.append(datetime.datetime.now().strftime("%H:%M:%S\t") + str(obj))
    if config != None and config["print_to_console"]:
        print(obj)

def flush_log(clear=False):
    with open(config["log_file"], "w", encoding="utf-8") as log_file:
        for line in logarray:
            log_file.write(line + os.linesep)
    if clear:
        logarray.clear()

# Test connection to the Trafiklab.se API
# Used to catch the ConnectionResetError usually raised by the first connection attempt
def dummy_connection():
    url = "http://api.sl.se/api2/realtimedeparturesV4.json"

    log("Testing dummy connection")
    log("Requesting " + url)
    with urlopen(url) as response:
        log("Response code: " + str(response.code))
        log("Response status: " + response.msg)
        response_string = response.read().decode(response.headers.get_content_charset() or 'utf-8')
        log("Dummy connection successful")

# Downloads and extracts the current traffic data for the specified station
# Traffic data from the SL Realtidsinformation 4 API (https://www.trafiklab.se/api/sl-realtidsinformation-4)
# site_id acquired from the SL Platsuppslag API (https://www.trafiklab.se/api/sl-platsuppslag)
def update(site_id, time_window):
    url = "http://api.sl.se/api2/realtimedeparturesV4.json?key=" \
          + config["apikey"] + "&siteid=" + str(site_id) + "&timewindow=" + str(time_window)

    log("Requesting " + url)
    try:
        with urlopen(url) as response:
            log("Response code: " + str(response.code))
            log("Response status: " + response.msg)
            response_string = response.read().decode(response.headers.get_content_charset() or 'utf-8')
    except HTTPError as err:
        log(traceback.format_exc())
        return None

    response_data = json.loads(response_string)

    if "StatusCode" in response_data and response_data["StatusCode"] != 0:
        if "Message" in response_data and response_data["Message"] and len(response_data["Message"]) > 0:
            log(str(response_data["StatusCode"]) + ": " + response_data["Message"])
        else:
            log(str(response_data["StatusCode"]))
    if "ExecutionTime" in response_data:
        log("Query time: " + str(response_data["ExecutionTime"]) + " ms")
    if "ResponseData" in response_data:
        return response_data["ResponseData"]
    else:
        log("Response body missing")
        return None

# Updates traffic data for all the stations specified in the config
def full_update():
    start = time.time()
    
    log("Updating " + str(len(config["stations"])) + " station" + ("s" if len(config["stations"]) != 1 else ""))

    if config["dummy_connection"]:
        try:
            dummy_connection()
        except ConnectionResetError as e:
            log("Dummy connection gave Connection Reset Error")
    
    stations = json.loads(json.dumps(config["stations"]))
    for station in stations:
        try:
            station["Departures"] = update(station["SiteId"], 60)
        except ConnectionResetError as e:
            log("Connection Reset Error, trying again")
            station["Departures"] = update(station["SiteId"], 60)
        if station["Departures"] is None:
            log("Error or invalid response, aborting update")
            return False

    with open(config["raw_file"], "w", encoding="utf-8") as raw_file:
        json.dump(stations, raw_file, separators=(',',':'))

    log("Update done after " + "{0:.2}".format(time.time() - start) + " s")
    return True


if __name__ == "__main__":
    try:
        weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        latest_update = datetime.datetime.min
        script_start = datetime.datetime.now()
        log("Starting " + str(script_start.date()))

        while True:
            with open('config.json', encoding="utf-8") as config_file:
                config = json.load(config_file)

            now = datetime.datetime.now()
            schedule = config["update_schedule"][weekdays[now.weekday()].lower()]
            perform_update = False
            for update_window in schedule:
                f, t = update_window["from"], update_window["to"]
                start = datetime.time(int(f[0:2]), int(f[3:5]))
                end = datetime.time(int(t[0:2]), int(t[3:5]))
                current = datetime.time(now.hour, now.minute)

                if start < current < end:
                    freq = update_window["freq"]
                    #log("Update frequency {0}s {1}-{2}: {3} min".format(weekdays[now.weekday()], f, t, freq))
                    delta = datetime.datetime.combine(now.date(), current) - datetime.datetime.combine(now.date(), start)
                    if (delta.total_seconds() // 60) % freq == 0 and (now - latest_update).total_seconds() // 60 > 4:
                        perform_update = True
                    break

            if perform_update:
                full_update()
                clear_log = latest_update.weekday() != now.weekday()
                flush_log(clear_log)
                if clear_log:
                    log("Running since " + str(script_start.date()))
                latest_update = now

            time.sleep(59)
        
    except BaseException as e:
        log("An unexpected error occurred:")
        log(traceback.format_exc())

    finally:
        flush_log()
