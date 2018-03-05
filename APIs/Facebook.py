import requests

from common.requester import get_request
from common.guarantee_content import guarantee_content
from common.configs import FACEBOOK_APP_ID, FACEBOOK_APP_SECRET


#-------- Globals for this API -------- #

BASE_URL = "https://graph.facebook.com"


#-------- Functionality -------- #

def get_access_token(from_facebook=False):
    # note that instead of generating an access token, the string "{appid}|{appsecret}"
    # can be used instead, which is permanent in contrast to the token (60 days).
    if from_facebook:
        access_token_url = BASE_URL + "/oauth/access_token"

        data = {"client_id":FACEBOOK_APP_ID,"client_secret":FACEBOOK_APP_SECRET,"grant_type":"client_credentials"}
        response = requests.get(access_token_url, params=data)

        return response.json()["access_token"]
    return "{}|{}".format(FACEBOOK_APP_ID, FACEBOOK_APP_SECRET)

def get_group(group_id, limit, show_members_posts=True, parser=lambda r: r.json()):
    '''
    Returns the `limit` most recent posts in group or page 
    with id `group_id` in json format.
    '''
    endpoint_to_use = "feed" if show_members_posts else "posts"

    fields = ["caption", "message", "from", "story", "object_id", "picture",
               "full_picture", "link", "name", "created_time", "description"]
    fields = ",".join(fields)

    get_group_url = BASE_URL + "/v2.11/{}/{}".format(group_id, endpoint_to_use)
    data = {"access_token":get_access_token(),
             "fields": fields, 
             "limit":limit if limit <= 100 else 100}

    response = get_request(get_group_url, params=data, parser=parser)
    return response

def validate_and_parse(response):
    """
    Validates the response in case the response was a 200 code but not the expected format.
    
    Returns: False if not validated, otherwise return the parsed response.
    """
    response = response.json()
    data = response.get("data")
    if data:
        # Check if all elements in `data` contains the following important keys.
        if guarantee_content(data, "id", "from", "created_time"):
            for post in data:
                post["group"], post["id"] = post["id"].split("_")
            return data
    return False


if __name__ == "__main__":
    from common.configs import DB_PATH
    from common.writer import write_json

    # note: page_id's can be used just as group_id (different result though)
    # fysiksektionen_page_id = "Fysiksektionen"
    fysiksektionen_group_id = "1225386484209166"

    fysiksektionen = get_group(fysiksektionen_group_id, 10, parser=validate_and_parse)

    # If validate_and_parse did not return False.
    if fysiksektionen:
        write_json(fysiksektionen, DB_PATH, "facebook.json")



