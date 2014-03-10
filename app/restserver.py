from flask import jsonify, abort, request, make_response, url_for, render_template
from flask.ext.sqlalchemy import SQLAlchemy
from app import app, db
from models import Tasks

    
@app.errorhandler(400)
def not_found(error):
    return make_response(jsonify( { 'error': 'Bad request' } ), 400)
 
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify( { 'error': 'Not found' } ), 404)

#Keeps track of all the entries in memory. Used for faster manipulation of data 
tasks = []
 
def make_public_task(task):
    new_task = {}
    for field in task:
        if field == 'id':
            new_task['uri'] = url_for('get_task', task_id = task['id'], _external = True)
        else:
            new_task[field] = task[field]
    return new_task

@app.route('/js')
def get_js():
    return render_template("task.js")

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

#Displaying all the entries    
@app.route('/todo/api/v1.0/tasks', methods = ['GET'])
def get_tasks():
    tasks = []
    temp = Tasks.query.all()
    for t in temp:
        task = {
            'id': t.id,
            'lat': t.lat,
            'lng': t.lng,
            'address': t.address,
            'name': t.name,
            'done': t.mark
        }
        tasks.append(task)
    return jsonify( { 'tasks': map(make_public_task, tasks) } )

#Getting an entry 
@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['GET'])
def get_task(task_id):
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    return jsonify( { 'task': make_public_task(task[0]) } )

#Creating an entry 
@app.route('/todo/api/v1.0/tasks', methods = ['POST'])
def create_task():
    if not request.json or not 'lat' in request.json:
        abort(400)
    if tasks:
        id = tasks[-1]['id'] + 1
    else:
        id = 1
    task = {
        'id': id,
        'lat': request.json['lat'],
        'lng': request.json['lng'],
        'address': request.json['address'],
        'name': request.json['name'],
        'done': False
    }
    tasks.append(task)
    t = Tasks (lat= request.json['lat'], lng=request.json['lng'], address=request.json['address'], name=request.json['name'])
    db.session.add(t)
    db.session.commit()
    return jsonify( { 'task': make_public_task(task) } ), 201

#Updating an entry 
@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['PUT'])
def update_task(task_id):
    
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    if not request.json:
        abort(400)
    if 'lat' in request.json and type(request.json['lat']) != unicode:
        abort(400)
    if 'lng' in request.json and type(request.json['lng']) != unicode:
        abort(400)
    if 'address' in request.json and type(request.json['address']) != unicode:
        abort(400)
    if 'name' in request.json and type(request.json['name']) != unicode:
        abort(400)
    if 'done' in request.json and type(request.json['done']) is not bool:
        abort(400)
    task[0]['lat'] = request.json.get('lat', task[0]['lat'])
    task[0]['lng'] = request.json.get('lng', task[0]['lng'])
    task[0]['address'] = request.json.get('address', task[0]['address'])
    task[0]['name'] = request.json.get('name', task[0]['name'])
    task[0]['done'] = request.json.get('done', task[0]['done'])
    temp = Tasks.query.get(int(task_id))
    temp.lat = request.json.get('lat', task[0]['lat'])
    temp.lng = request.json.get('lng', task[0]['lng'])
    temp.address = request.json.get('address', task[0]['address'])
    temp.name = request.json.get('name', task[0]['name'])
    temp.mark = request.json.get('done', task[0]['done'])
    db.session.commit()
    return jsonify( { 'task': make_public_task(task[0]) } )

#Deleting an entry    
@app.route('/todo/api/v1.0/tasks/<int:task_id>', methods = ['DELETE'])
def delete_task(task_id):
    task = filter(lambda t: t['id'] == task_id, tasks)
    if len(task) == 0:
        abort(404)
    tasks.remove(task[0])
    temp = Tasks.query.get(int(task_id))
    db.session.delete(temp)
    db.session.commit()
    return jsonify( { 'result': True } )