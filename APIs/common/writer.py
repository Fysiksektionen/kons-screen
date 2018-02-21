import json

def write_json(jsondata, BASE_PATH, path):
    """
    Writes json to the full absolute path as provided by `BASE_PATH + path`.
    """
    full_path="{}{}".format(BASE_PATH, path)
    with open(full_path, "w") as db:  # dump json to file.
        json.dump(jsondata, db, indent=4, separators=(',', ': '))