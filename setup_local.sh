#!/usr/bin/env bash

# SAVE THE CORRECT PATHS TO FILE UPON INITIAL SETUP
file_to_write="$PWD/backend/APIs/common/paths.py"

if [ -f "$file_to_write" ]; then
    echo "LOGGING_PATH = '$PWD/backend/APIs/'" > "$file_to_write"
    echo "DB_PATH = '$PWD/backend/APIs/db/'" >> "$file_to_write"
    echo "* kons-screen: Exported DB paths"
else
    echo "Error: '$file_to_write' is not a file"
    echo "Setup was unsuccessful."
    exit
fi

# PYTHON SETUP

# If no python installation was found, prompt for installation of python3.
if !([ $(command -v python) ] || [ $(command -v python3) ]); then
    echo "Error: Couldn't find a python installation (inspected python and python3)."
    echo 'Do you want to install the missing program python3?'
    select yn in "Yes" "No";
    do
        case $yn in
            Yes ) echo '* kons-screen: Installing python3...'; sudo apt-get install python3 ; break;;
            No ) echo 'Setup was unsuccessful'; exit;;
        esac
    done
fi

#Installation of backend/requirements.txt
pyver="$(python -V 2>&1)"
if [[ $pyver == "Python 3."* ]]; then 
    echo '* kons-screen: Installing requirements.txt...'
    pip install -r backend/requirements.txt
else
    if [ $(command -v python3) ]; then
        # Checks if pip3 is a command, if not then install it pip3
        if [ $(command -v pip3) ]; then
            echo '* kons-screen: Installing requirements.txt...'
            pip3 install -r backend/requirements.txt
        else
            echo "Couldn't find python's official package manager pip3, do you want to install it? (1/2)"
            select yn in "Yes" "No"; do
                case $yn in
                    Yes ) echo "* kons-screen: Installing python3-pip..."; sudo apt-get install python3-pip;break;;
                    No ) echo "Setup was unsuccessful"; exit;;
                esac
            done
            echo '* kons-screen: Installing requirements.txt...'
            pip3 install -r backend/requirements.txt
        fi
    else
        echo "Error: Couldn't find a python installation of version 3+ (inspected python and python3)."
        echo "Setup was unsuccessful"
        exit
    fi
fi

# NODE AND NPM SETUP
node_ver=''
if [ $(command -v node) ]; then
    node_ver=$(node -v)
else
    if [ $(command -v nodejs) ]; then
        node_ver=$(nodejs -v)
    else
        echo "Error: Could not find any installation of node/nodejs"
        echo "Do you want to install the missing program nodejs?"
        select yn in "Yes" "No";
        do
            case $yn in
                Yes ) echo "* kons-screen: Installing nodejs..."; curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash - ; sudo apt-get install -y nodejs; break;;
                No ) echo "Setup of frontend/ was unsuccessful"; exit;;
            esac
        done
        node_ver=$(nodejs -v)
    fi
fi

# NPM
if [ $node_ver ]; then
    # Regex means Node v4.0.0 or higher (v10.* should also match)
    if [[ $(echo $node_ver | grep -E "^v[4-9]\.|^v[0-9][0-9]\.") ]]; then
        if [ $(command -v npm) ]; then
            echo "* kons-screen: Installing node_modules..."
            cd $PWD/frontend
            npm install
        else
            echo "Couldn't find the package manager npm, do you want to install it? (1/2)"
            select yn in "Yes" "No";
            do
                case $yn in
                    Yes ) echo "* kons-screen: Installing npm..."; apt-get install npm; break;;
                    No ) echo "Setup of frontend/ was unsuccessful"; exit;;
                esac
            done
            echo "* kons-screen: Installing node_modules..."
            cd $PWD/frontend
            npm install
        fi
        
    else
        echo "Error: couldn't find a node version of 4.0.0+"
        echo "Setup of frontend/ was unsuccessful"
        exit
    fi
fi

echo "* kons-screen: Setup ran successfully. If you received any errors it is most likely"
echo "due to a lack of permissions, try rerunning the script with sudo. If reinstalling "
echo "then first delete frontend/node_modules and then reinstall."
echo ""
