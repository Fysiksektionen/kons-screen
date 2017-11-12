import requests
import json

from config import APP_ID, APP_SECRET

BASE_URL = "https://graph.facebook.com"

def get_access_token(from_facebook=False):
    # note that instead of generating an access token, the string "{appid}|{appsecret}"
    # can be used instead, which is permanent in contrast to the token (60 days).
    if from_facebook:
        access_token_url = BASE_URL + "/oauth/access_token"

        data = {"client_id":APP_ID,"client_secret":APP_SECRET,"grant_type":"client_credentials"}
        response = requests.get(access_token_url, params=data)

        return response.json()["access_token"]
    return "{}|{}".format(APP_ID, APP_SECRET)

def get_group(group_id, limit, show_members_posts=True):
    '''
    Returns the `limit` most recent posts in group or page 
    with id `group_id` in json format.
    '''
    endpoint_to_use = "feed" if show_members_posts else "posts"

    get_group_url = BASE_URL + "/v2.11/{}/{}".format(group_id, endpoint_to_use)
    data = {"access_token":get_access_token(), "limit":limit if limit <= 100 else 100}

    response = requests.get(get_group_url, params=data)
    return response.json()

def parse(response):
    '''Reformats the response to be more accessible.'''
    for post in response["data"]:
        post["group"], post["id"] = post["id"].split("_")
    return response["data"]

if __name__ == "__main__":
    # note: page_id's can be used just as group_id (different result though)
    fysiksektionen_page_id = "Fysiksektionen"  
    fysiksektionen_group_id = "1225386484209166"

    fysiksektionen = parse(get_group(fysiksektionen_group_id, 10))

    with open("recent_facebook.json", "w") as db:  # dump json to file.
        json.dump(fysiksektionen, db, indent=4, separators=(',', ': '))





