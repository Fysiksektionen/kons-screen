# NOTE: If you can find a better way to parse the RSS feed feel free to change this.

import requests

from bs4 import BeautifulSoup as Soup

from common.requester import get_request
from common.guarantee_content import guarantee_content


#-------- Globals for this API -------- #

BASE_URL = "https://f.kth.se/feed"


#-------- Functionality -------- #

def get_items(limit=5):
    '''Get's the first `limit` items in the RSS feed of "https://f.kth.se/feed".'''
    rss = get_request(BASE_URL)

    # replace a poorly formatted tag in order to be parsed properly by Soup.
    rss = rss.text.replace("content:encoded", "content")

    # html.parser suffices for xml if you format the tags correctly, like above.
    # This way we avoid extra third party libraries (xml parsers).
    soup = Soup(rss, "html.parser")

    return to_json(soup.find_all("item"))[:limit]

def to_json(items):
    '''
    Converts a list of RSS items to json, doesn't preserve 
    unnecessary attributes such as `creator` and `link`.
    '''
    jsonitems = []
    for item in items:
        json = {}
        json["category"] = item.category.get_text()
        json["published"] = item.pubdate.get_text()
        json["content"] = item.content.get_text()
        json["title"] = item.title.get_text()
        
        # soup the description string in order to remove some extraneous html (the read more link)
        description = Soup(item.description.get_text(), "html.parser").get_text()
        json["description"] = description.strip("Lär mer") + " [...]"
        
        jsonitems.append(json)
    return jsonitems

def validate(items):
    """
    Validates the response in case the response was a 200 code but not the expected format.
    
    Returns: False if not validated, otherwise return the parsed response.
    """
    guaranteed_keys = ("category","published","content","title","description")
    
    # Check if all elements in `items` contains the following important keys.
    valid = False
    if guarantee_content(items, *guaranteed_keys):
        valid = True
        for item in items:
            # The items should not only exist but not be empty in this case.
            # If one of these fail, then valid becomes False
            valid = valid and all([item.get(key) for key in guaranteed_keys])
    return valid


if __name__ == "__main__":
    from common.configs import BASE_PATH
    from common.writer import write_json

    items  = get_items(limit=5)

    if validate(items):
        write_json(items, BASE_PATH, "db/fnews.json")
