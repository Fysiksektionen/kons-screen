import json
import requests
from bs4 import BeautifulSoup

# from config import APP_ID, APP_SECRET
# Instagram API is apparently only for user-interactive apps.

BASE_URL = "https://www.instagram.com/"

def get_media_content(page):
    response = requests.get(BASE_URL + page)

    soup = BeautifulSoup(response.text, "html.parser")
    jsondata = str(soup.find_all("script")[2])

    beginning_of_data = jsondata.index("{")
    jsondata = json.loads(jsondata[beginning_of_data:].strip(";</script>"))

    media_content = jsondata["entry_data"]["ProfilePage"][0]["user"]["media"]["nodes"]
    return media_content

if __name__ == "__main__":
    instagram_page = "Fysiksektionen"
    media_content = get_media_content(instagram_page)

    with open("recent_instagram.json", "w") as db:  # dump json to file.
        json.dump(media_content, db, indent=4, separators=(',', ': '))

