function TasksViewModel() {
            var self = this;
            self.tasksURI = 'http://girishubertest.heroku.com/todo/api/v1.0/tasks';
            self.username = "";
            self.password = "";
            self.tasks = ko.observableArray();

            self.ajax = function(uri, method, data) {
                var request = {
                    url: uri,
                    type: method,
                    contentType: "application/json",
                    accepts: "application/json",
                    cache: false,
                    dataType: 'json',
                    data: JSON.stringify(data),
                    beforeSend: function (xhr) {
                        xhr.setRequestHeader("Authorization", 
                            "Basic ");
                    },
                    error: function(jqXHR) {
                        alert("ajax error " + jqXHR.status);
                    }
                };
                return $.ajax(request);
            }
            self.updateTask = function(task, newTask) {
                var i = self.tasks.indexOf(task);
                self.tasks()[i].uri(newTask.uri);
                self.tasks()[i].lat(newTask.lat);
                self.tasks()[i].lng(newTask.lng);
                self.tasks()[i].address(newTask.address);
                self.tasks()[i].name(newTask.name);
                self.tasks()[i].done(newTask.done);
            }

            self.beginAdd = function() {
                $('#add').modal('show');
            }
            self.add = function(task) {
                self.ajax(self.tasksURI, 'POST', task).done(function(data) {
                    self.tasks.push({
                        uri: ko.observable(data.task.uri),
                        lat: ko.observable(data.task.lat),
                        lng: ko.observable(data.task.lng),
                        address: ko.observable(data.task.address),
                        name: ko.observable(data.task.name),
                        done: ko.observable(data.task.done)
                    });
                });
            }
            self.beginEdit = function(task) {
                editTaskViewModel.setTask(task);
                $('#edit').modal('show');
            }
            self.edit = function(task, data) {
                self.ajax(task.uri(), 'PUT', data).done(function(res) {
                    self.updateTask(task, res.task);
                });
            }
            self.remove = function(task) {
                self.ajax(task.uri(), 'DELETE').done(function() {
                    self.tasks.remove(task);
                });
            }
            self.mapIt = function(task) {
                mapTaskViewModel.setMap(task);
                $('#mapDiv').modal('show');
            }
            self.markInProgress = function(task) {
                self.ajax(task.uri(), 'PUT', { done: false }).done(function(res) {
                    self.updateTask(task, res.task);
                });
            }
            self.markDone = function(task) {
                self.ajax(task.uri(), 'PUT', { done: true }).done(function(res) {
                    self.updateTask(task, res.task);
                });
            }

            self.ajax(self.tasksURI, 'GET').done(function(data) {
                for (var i = 0; i < data.tasks.length; i++) {
                    self.tasks.push({
                        //tasks: ko.observable(data.tasks);
                        uri: ko.observable(data.tasks[i].uri),
                        lat: ko.observable(data.task[i].lat),
                        lng: ko.observable(data.task[i].lng),
                        address: ko.observable(data.task[i].address),
                        name: ko.observable(data.task[i].name),
                        done: ko.observable(data.task[i].done)
                    });
                }
            });
        }
        function AddTaskViewModel() {
            var self = this;
            self.lat = ko.observable();
            self.lng = ko.observable();
            self.address = ko.observable();
            self.name = ko.observable();
        
            self.addTask = function() {
                geocoder.geocode({'address':self.address()}, function (results, status){
                    if (status == google.maps.GeocoderStatus.OK) {
                        self.lat(results[0].geometry.location.d.toString());
                        self.lng(results[0].geometry.location.e.toString());
                        //console.log(results);
                        console.log(self.lat());
                        console.log(self.lng());
                        $('#add').modal('hide');
                        tasksViewModel.add({
                            lat: self.lat(),
                            lng:self.lng(),
                            address:self.address(),
                            name:self.name()
                        });
                        self.lat("");
                        self.lng("");
                        self.address("");
                        self.name("");
                    } else {
                        alert ("Geocode was not successful for the following reason " + status);
                    }
                });
            }
        }
        function MapTaskViewModel() {
            var self = this;
            self.mapOne = ko.observable({
                            lat: ko.observable(12.24),
                            lng:ko.observable(24.54)
                        });

             self.setMap = function(task) {
                self.task = task;
                self.mapOne({lat: task.lat(), lng: task.lng()});
                $('mapDiv').modal('show');
            }
        }
        function EditTaskViewModel() {

            var self = this;
            self.lat = ko.observable();
            self.lng = ko.observable();
            self.address = ko.observable();
            self.name = ko.observable();
            self.done = ko.observable();
            
            self.setTask = function(task) {
                self.task = task;
                self.lat(task.lat());
                self.lng(task.lng());
                self.address(task.address());
                self.name(task.name());
                self.done(task.done());
                $('edit').modal('show');
            }
 
            self.editTask = function() {
                geocoder.geocode({'address':self.address()}, function (results, status){
                    if (status == google.maps.GeocoderStatus.OK) {
                        self.lat(results[0].geometry.location.d.toString());
                        self.lng(results[0].geometry.location.e.toString());
                        $('#edit').modal('hide');
                        tasksViewModel.edit(self.task, {
                            lat: self.lat(),
                            lng: self.lng(),
                            address: self.address(),
                            name: self.name(),
                            done: self.done()
                        });
                    } else {
                        alert ("Geocode was not successful for the following reason " + status);
                    }
                });
            }
        }

        ko.bindingHandlers.map = {
            init: function (element, valueAccessor) {  
            },
            update: function(element, valueAccessor) {
                 var mapObj = ko.utils.unwrapObservable(valueAccessor());
                    var latLng = new google.maps.LatLng(mapObj.lat, mapObj.lng); 
                    var mapOptions = { center: latLng, zoom: 6, mapTypeId: google.maps.MapTypeId.ROADMAP};
                    mapObj.googleMap = new google.maps.Map(element, mapOptions);
        
                    mapObj.marker = new google.maps.Marker({
                        map: mapObj.googleMap,
                        position: latLng,
                        title: "You Are Here",
                        draggable: true
                    }); 
                    google.maps.event.addListenerOnce( mapObj.googleMap, 'idle', function() {
                        google.maps.event.trigger( mapObj.googleMap, 'resize');
                        latLng = mapObj.marker.getPosition();
                        mapObj.googleMap.setCenter(latLng);
                    });
                    
            }
        };

        
        var tasksViewModel = new TasksViewModel();
        var addTaskViewModel = new AddTaskViewModel();
        var editTaskViewModel = new EditTaskViewModel();
        var mapTaskViewModel = new MapTaskViewModel();

        ko.applyBindings(tasksViewModel, $('#main')[0]);
        ko.applyBindings(addTaskViewModel, $('#add')[0]);
        ko.applyBindings(editTaskViewModel, $('#edit')[0]);
        ko.applyBindings(mapTaskViewModel, $('#map1Div')[0]);
        var geocoder = new google.maps.Geocoder();