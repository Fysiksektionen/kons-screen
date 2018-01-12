import json
import requests

# from config import APP_ID, APP_SECRET
# Instagram public API is apparently only for user-interactive apps.

BASE_URL = "https://www.instagram.com/graphql/query/"

# Just in case Instagram doesn't like people using their "private" API.
USER_AGENT = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36"}

def get_media_content(page_id, limit=10, parsed=True):
    """Returns the `limit` most recent posts from `page_id`"""
    variables = {"id":page_id, "first":limit}
    data= {"query_id":17888483320059182, "variables":json.dumps(variables)}

    response = requests.get(BASE_URL, params=data, headers=USER_AGENT)
    if parsed:
        return parse(response.json())
    return response.json()

def parse(response):
    # edges is list of all post data.
    edges = response["data"]["user"]["edge_owner_to_timeline_media"]["edges"]
    nodes = [post["node"] for post in edges]
    for node in nodes:
        # Rename keys and reduce some nesting in the data.
        node["code"] = node.pop("shortcode")
        node["caption"] = node.pop("edge_media_to_caption")["edges"][0]["node"]["text"]
    return nodes

if __name__ == "__main__":
    instagram_page = "2905411461"
    media_content = get_media_content(instagram_page)

    with open("recent_instagram.json", "w") as db:  # dump json to file.
        json.dump(media_content, db, indent=4, separators=(',', ': '))

