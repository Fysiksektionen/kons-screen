# kons-screen
Kod till Raspberry Pi-en som driver skärmen i Konsulatet

Vad vi vill ha på skärmen:

* Busstider, eventuelt med tidsjustering
* Prislistor, gärna enkla att ändra. Koppla till iZettle?
* Någon form för nyhetsflöde (facebook, hemsidan, instagram)
* Roliga bilden
* Sektionskalender
* Meny?

Vad vi har:

* Busstider
    * Hämting av data från SL
* Prislistor
    *
* Nyhetsflöde
    * Hämting av data från lämplig källa
* Roliga bilder
    *
* Sektionskalender
    * Hämting av events
* Meny
    *

Vad vi behöver:

* Testplatform
* GUI
    * Vad ska var. Adam
* Busstidar
    * Hämting av data från server till Pi. Yashar
    * Gör snyggt. Seb
* Prislistor
    * Koppling till iZettle
    * Hämting av prisar till Pi
* Nyhetsflöde
    * Gör snyggt. Helmer
* Roliga bilder
    * Hämting av bilder
    * Slideshow-funktionalitet
* Sektionskalender
    * Gör snyggt. Helmer
* Meny
    * Hämting av menyer
* Stabilitet. Axel

## Installation
Det borde i de flesta fall räcka med att köra

    ./setup.sh
    
i rot-directoryn (dvs `kons-screen/`).

### Manuell installation
Följande instruktioner förutsätter att `python` är av version python3.4+.
Kolla din python-version med `python --version`. I vissa fall finner du python3 genom `python3`.
#### Frontend
Om du inte redan har `nodejs` eller `npm` så kör du

    sudo apt-get install nodejs

och därefter

    sudo apt-get install npm

För att sedan installera appen så går du in i `frontend/` och kör

    npm install

#### Backend
För att installera alla dependencies till `app.py` så kan du köra kommandot

    pip3 install -r requirements.txt

Om kommandot `pip3` inte känns igen så kör du samma kommando fast med `pip` istället.
Om detta mot all förmodan inte skulle fungera så måste du först installera pip med

    sudo apt-get install python-pip

eller

    sudo apt-get install python3-pip

## Användning

### Frontend
För att förhandsgranska `index.html` så måste du först köra `npm start` när du är i `frontend/`.
Efter detta så serveras appen på `localhost:3000`. För att data ska fyllas i så måste `app.py` köras,
se instruktioner nedan.

### Backend
Det finns flera sätt att köra `app.py` på; du kan välja mellan att använda en lokal databas,
eller att koppla upp dig mot https://f.kth.se och använda data som uppdateras regelbundet.
För att använda en lokal databas så kör du kommandot `python app.py` och för att använda data
från https://f.kth.se så körs istället `python app.py --remotedb`.

Datan i `APIs/db/` är gammal
så i vissa fall måste datan uppdateras manuellt för att den ska visas på frontend.

Ytterligare startalternativ till `app.py` är `--debug` som tillåter dig att spara ändringar och se dessa
genom att bara uppdatera sidan istället för att behöva starta om `app.py`.

Exempelanvändning: `python app.py --debug --remotedb`.
