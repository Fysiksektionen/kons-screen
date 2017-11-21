import requests
from bs4 import BeautifulSoup as Soup

BASE_URL = "https://f.kth.se/feed"

"""NOTE: If you can find a better way to parse the RSS feed feel free to change this."""

def get_items(limit=5):
    '''Get's the first `limit` items in the RSS feed of "https://f.kth.se/feed".'''
    rss = requests.get(BASE_URL)

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


