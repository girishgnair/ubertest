from app import db

# This is the definition of the task that you want to store
class Tasks(db.Model):
    id = db.Column(db.Integer, primary_key = True)
    lat = db.Column(db.String(64), index = True, unique = False)
    lng = db.Column(db.String(64), index = True, unique = False)
    address = db.Column(db.String(250), index = True, unique = False)
    name = db.Column(db.String(150), index = True, unique = False)
    mark = db.Column(db.Boolean(False), index = True, unique = False)
    
    #Used for debugging purpose
    def __repr__(self):
        return '<Task %r>' % (self.name)