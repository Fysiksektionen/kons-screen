# kons-screen
Kod till Raspberry Pi:en som driver skärmen i Konsulatet

## Innehållsförteckning

* [Innehållsförteckning](#innehållsförteckning)
* [Balena setup](#balena-setup)
* [Lokal setup](#lokal-setup)
    * [Manuell setup](#manuell-setup)
        * [Frontend](#frontend)
        * [Backend](#backend)
* [Användning](#användning)
	* [Testning](#testning)
	* [Separat körning](#separat-körning)
	    * [Frontend](#separat-körning)
	    * [Backend](#separat-körning)

## Balena setup
Börja med att logga in med github (rekommenderat) på [balena.io](https://www.balena.io/). Därefter skapar du en ny Raspberry Pi applikation och klickar sedan på **+Add device**. Följ instruktionerna och välj inställningar som passar behovet. [Här finns en mer detaljerad guide](https://www.balena.io/docs/learn/getting-started/raspberrypi3/nodejs/#adding-your-first-device) som går igenom varje steg, koden som du pushar kan du ersätta med denna repository. Ibland appliceras inte förändringar på pi:en direkt efter en push och då räcker det med en enkel restart genom balenas device-dashboard.

<span style="color:orange">**VIKTIGT**</span>: För att skärmen överhuvudtaget ska visa någonting så måste du även lägga till en custom-config-variabel till din device. Detta görs genom tabben "Device configuration". Scrolla ner längst ner och klicka på **+Add custom variable** och ange någon av följande variabelvärden:

| Key                                 | Value
|-------------------------------------|----------
|**`RESIN_HOST_CONFIG_gpu_mem_256`**  | **`128`**
|**`RESIN_HOST_CONFIG_gpu_mem_512`**  | **`196`**
|**`RESIN_HOST_CONFIG_gpu_mem_1024`** | **`396`**

Det borde räcka med `RESIN_HOST_CONFIG_gpu_mem_256` och `128`. Mer detaljerad information om detta finns i `kons-screen/wpe/README.md` eller på [balena-wpe](https://github.com/balena-io-projects/balena-wpe/blob/master/README.md) repon.

Om allt gått bra och ingenting spökar så borde det nu gå att pusha till och styra hallonpajen över internet!

## Lokal setup
Det borde i de flesta fall räcka med att köra

    ./setup_local.sh

i rot-directoryn (dvs `kons-screen/`). 
* NOTE: Den kommer att ändra filen `backend/APIs/common/paths.py` 
men du borde inte committa dessa ändringar eftersom de pekar på dina lokala paths.

### Manuell setup
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
Om du vill köra hela appen samtidigt så räcker det med att köra

    ./run.sh

i rot-directoryn (dvs `kons-screen/`).

Argument till `run.sh` (flera argument separeras med mellanslag):

    ./run.sh --remotedb
    ./run.sh --debug
`--remotedb` gör så att appen använder data från f.kth.se istället för lokal data.
Den lokala datan är gammal så i vissa fall måste datan uppdateras manuellt för att den
ska visas på frontend.

`--debug` är endast relevant om du redigerar saker på backend och inte vill starta om hela
 skriptet för att servern ska uppdateras. Du behöver då endast uppdatera sidan för att ändringarna
 ska få effekt.
 ### Testning
För att starta testköraren för hela applikationen så körs kommandot

    npm test

 i `kons-screen/frontend`. App.test.js renderar dock hela applikationen varje gång du sparar och söker dessutom efter alla tester som ska köras, så om du
 önskar att få snabbare respons på testerna med nackdelen att App.js inte testas
 så kan du köra

    npm run watch

 i `kons-screen/frontend`. För tillfället körs då alla tester i `kons-screen/frontend/src/js/data_compilers/`, vilket råkar vara där just alla övriga tester som inte är `App.js.test` ligger. Om fler tester tillkommer så borde regexen för `watch` under `scripts` i `package.json` ändras.

### Separat körning

#### Frontend
För att förhandsgranska `index.html` så måste du först köra `npm start` när du är i `frontend/`.
Efter detta så serveras appen på `localhost:3000`. För att data ska fyllas i så måste `app.py` köras,
se instruktioner nedan.

#### Backend
Det finns flera sätt att köra `app.py` på; du kan välja mellan att använda en lokal databas,
eller att koppla upp dig mot https://f.kth.se och använda data som uppdateras regelbundet.
För att använda en lokal databas så kör du kommandot `python app.py` och för att använda data
från https://f.kth.se så körs istället `python app.py --remotedb`.

Datan i `APIs/db/` är gammal
så i vissa fall måste datan uppdateras manuellt för att den ska visas på frontend.

Ytterligare startalternativ till `app.py` är `--debug` som tillåter dig att spara ändringar och se dessa
genom att bara uppdatera sidan istället för att behöva starta om `app.py`.

Exempelanvändning: `python app.py --debug --remotedb`.
