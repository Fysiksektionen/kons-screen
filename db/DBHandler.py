import json

class DB(dict):
    def __init__(self, fname, force_update=False, read_only=False):
        self.fname = fname
        self.force_update = force_update  # If True: rewrite db even if items are the same
        self.read_only = read_only
        self._json = {}
        try:
            with open(fname,'r') as db:
                filecontent = db.read()
                if filecontent:
                    self._json = json.loads(filecontent)
        except FileNotFoundError:
            print("Could not find file '{}', created new file '{}'".format(fname,fname))
            open(fname,"w").close()
        super().__init__(self, **self._json)

    def update(self):
        current_items = self.items()
        if not self.read_only:
            if self._json.items() != current_items or self.force_update:
                with open(self.fname,'w') as db:
                    json.dump(self, db, indent=4, separators=(',', ': '))
                    self._json = current_items
                    print("rewrote")

    def __enter__(self):
        return self

    def __exit__(self, exc_msg, exc_type, traceback):
        self.update()