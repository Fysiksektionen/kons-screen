

def guarantee_content(nodes, *guaranteed_keys):
    """
    Returns True if all items in `guaranteed_keys` are in each element of `nodes`.
    Returns False otherwise
    """
    success = True
    for node in nodes:
        success = success and all(map(lambda key: key in node, guaranteed_keys))
        if not success:
            break
    return success