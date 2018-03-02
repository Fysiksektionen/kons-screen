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
För att installera alla dependencies så kan du köra kommandot

    pip3 install -r requirements.txt

För att endast köra app.py så räcker det med 

    pip3 install flask

Om kommandot `pip3` inte känns igen så kör du samma kommando fast med `pip` istället.
Om detta mot all förmodan inte skulle fungera så måste du först installera pip med 

    sudo apt-get install python-pip

eller 

    sudo apt-get install python3-pip

## Användning
Följande instruktioner förutsätter att `python` är av version python3.5+. 
Kolla din python-version med `python --version`. I vissa fall finner du python3 genom `python3`.

För att förhandsgranska `index.html` så måste du först köra `app.py` som sedan levererar
`index.html` på http://127.0.0.1:5000. Det finns flera sätt att köra `app.py` på; du kan
välja mellan att använda en lokal databas, eller att koppla upp dig mot https://f.kth.se
och använda data som uppdateras regelbundet. För att använda en lokal databas så kör du
kommandot `python app.py` och för att använda data från https://f.kth.se så körs istället
`python app.py --remotedb`. Det rekommenderas att använda en lokal databas när man utvecklar 
för front-end eftersom det underlättar att fixera så många parametrar som möjligt när man 
vill debugga. 

Ytterligare startalternativ är `--debug` som tillåter dig att spara ändringar och se dessa
genom att bara uppdatera sidan istället för att behöva starta om `app.py`.

Exempelanvändning: `python app.py --debug --remotedb`

Efter att ha startat `app.py` så är det som sagt bara att besöka http://127.0.0.1:5000.

