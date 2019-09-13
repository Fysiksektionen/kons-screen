#!/usr/bin/env bash

# Tries to find the correct python to run. Throws if none found.
if [ "$(command -v python3)" ]; then
    # "$@" is string of the arguments passed.
    # In this case all arguments should be passed to app.py
    python3 "$PWD/backend/app.py" "$@"  & pid1="$!"
    cd frontend
    npm start
    kill $pid1 # kill app.py process when npm server exits.
else
    if [ "$(command -v python)" ]; then
        pyver="$(python -V 2>&1)"
        if [[ $pyver == "Python 3."* ]]; then
            # "$@" is string of the arguments passed.
            # In this case all arguments should be passed to app.py
            python "$PWD/backend/app.py" "$@" & pid1="$!"
            cd frontend
            npm start
            kill $pid1 # kill app.py process when npm server exits.
        else
            echo 'Error: Couldnt find a python installation of version 3+ (inspected python and python3).'
            exit 1
        fi
    else
        echo 'Error: Couldnt find a python installation of version 3+ (inspected python and python3).'
        exit 1
    fi
fi