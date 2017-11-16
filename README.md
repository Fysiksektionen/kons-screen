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
    *
* Prislistor
    *
* Nyhetsflöde
    *
* Roliga bilder
    *
* Sektionskalender
    *
* Meny
    *

Vad vi behöver:

* Testplatform
* GUI
* Busstidar
    * Hämting av data från SL. Yashar kollar
* Prislistor
    * Koppling till iZettle
    * Hämting av prisar till Pi
* Nyhetsflöde
    * Hämting av data från lämplig källa
* Roliga bilder
    * Hämting av bilder
    * Slideshow-funktionalitet
* Sektionskalender
    * Hämting av events
* Meny
    * Hämting av menyer

## Installation
För att installera alla dependencies så kan du köra kommandot

    pip3 install -r requirements.txt

För att endast köra app.py så räcker det med 

    pip3 install flask flask-socketio

Om kommandot `pip3` inte känns igen så kör du samma kommando fast med `pip` istället.
Om detta mot all förmodan inte skulle fungera så måste du först installera pip med 

    sudo apt-get install python-pip

eller 

    sudo apt-get install python3-pip