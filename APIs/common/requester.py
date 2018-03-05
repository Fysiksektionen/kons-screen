import requests
import time
from urllib.parse import urlencode

from common.configs import BASE_PATH

# Custom exception
class UnexpectedResponseCode(Exception):pass

def get_request(url, params={}, headers={}, parser=lambda x:x):
    """
    Wraps get requests and retries with exponential backoff if the request failed.
    Raises error if response code was not 2xx after 6 attempts.
    Returns the request object if successfull, otherwise return None or raise error.
    """
    attempts = 0
    while attempts < 7:
        try:
            response = requests.get(url, params=params, headers=headers)
        except (Exception) as exception:
            if attempts >= 6:  # else loop again and retry
                # Should log the raising of error
                raise exception
            # Should do some logging of the exception and retries here.
        else:  # no exception encountered, check response code
            # only allow response codes 200-299
            if divmod(response.status_code, 100)[0] == 2:
                #response code was 2xx, wrap response in parser call
                return parser(response)
            else:
                if attempts < 6:
                    # Should do some logging here
                    pass
                else:
                    # Should log the raising of error
                    raise UnexpectedResponseCode("UnexpectedResponseCode {}: {}".format(response.status_code,response.text[:1000]))
        time.sleep(attempts and 2**attempts)
        attempts += 1
    return None  # explicitly return None if everything else failed, for sake of clarity.
