import requests
import json

from common.guarantee_content import guarantee_content 
from common.requester import get_request

# from config import APP_ID, APP_SECRET
# Instagram public API is apparently only for user-interactive apps.


#-------- Globals for this API -------- #

BASE_URL = "https://www.instagram.com/graphql/query/"

# Just in case Instagram doesn't like people using their "private" API.
USER_AGENT = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"}


#-------- Functionality -------- #

def get_media_content(page_id, limit=10, parser=lambda r: r.json()):
    """
    Returns the `limit` most recent posts from `page_id`
    """
    
    variables = {"id":page_id, "first":limit}
    data= {"query_id":"17888483320059182", "variables":json.dumps(variables)}

    response = get_request(BASE_URL, params=data, headers=USER_AGENT, parser=parser)
    return response

def validate_and_parse(response):
    """
    Validates the response in case the response was a 200 code but not the expected format.
    
    Returns: False if not validated, otherwise return the parsed response.
    """
    response = response.json()
    if response.get("status") == "ok":
        # Traverse down the nested response
        edges = response.get("data", {}).get("user",{}).get("edge_owner_to_timeline_media",{}).get("edges", [])
        if edges:
            nodes = [post.get("node") for post in edges]
        
            # Check if all elements in `nodes` contains the following important keys.
            guaranteed_keys = ("shortcode", "id","display_url","dimensions","edge_media_to_caption")
        
            if guarantee_content(nodes, *guaranteed_keys):
                for node in nodes:
                    # Rename keys and reduce some nesting in the data.
                    node["code"] = node.pop("shortcode")
                    caption_node = node.pop("edge_media_to_caption")
                    if caption_node.get("edges"):
                        node["caption"] = caption_node.get("edges")[0].get("node",{}).get("text","")
                    else:
                        node["caption"] = ""
                return nodes
    # If here, any of the if-statements above failed meaning the validation failed.
    return False


if __name__ == "__main__":
    from common.paths import DB_PATH
    from common.writer import write_json

    instagram_page = "2905411461"
    media_content = get_media_content(instagram_page, parser=validate_and_parse)

    # If validate_and_parse did not return False.
    if media_content:
        write_json(media_content, DB_PATH, "instagram.json")


