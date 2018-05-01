var _resp, _req;
var _record;
PROFILESTABLE="device_profiles";

function device_profiles(req, resp){
    ClearBlade.init({request:req});
    log(req);
    _resp=resp;
    _req=req;
    values=req.params;
    if (values.DELETE) {
        resp.success('DELETE');
    }
    else if (values.UPDATE) { //Create or Update based upon values
        delete values.UPDATE;
        updateRecord(PROFILESTABLE, values);
    }
    else if (values.GET) { //Create or Update based upon values
        processRecord(PROFILESTABLE, values.item_id);
    }        
    else if (values.CREATE) { //Create or Update based upon values
        createRecord(PROFILESTABLE, values);
    }
    else { //Read All Data if there is no operation defined
        queryAll();
    }
}

function queryAll() {
    var q = ClearBlade.Query({collectionName:PROFILESTABLE});
    promiseQuery(q).then(function(r){
    profiles={};
    r.forEach(function(f) {
        profiles[f.item]=f;
        });
        _resp.success(profiles);
    })
    .catch(function(err) {
        _resp.error(err);
    });
}

//Update an existing record
function updateRecord(TABLE, values) {
    var query = ClearBlade.Query({collectionName:TABLE});
    query.equalTo('item_id', values.item_id);
    query.update(values, statusCallBack);
}

//Create a record
function createRecord(TABLE, values) {
    var col = ClearBlade.Collection( {collectionName: TABLE } );
    col.create(values, statusCallBack);
}

//Locate a recro by item_id
function findRecord(TABLE, values) {
    _record=values; //Global for inner loop
    log("processRecord");
    var query = ClearBlade.Query({collectionName: TABLE});
    query.equalTo('item_id', values.item_id);
    d = Q.defer();
	query.fetch(function(err, result) {
        if (err) {
            d.reject(new Error(err));
        } else {
            d.resolve(result.DATA);
        }
    });
    return d.promise;
}

//Shared Status Callback
var statusCallBack = function (err, data) {
    if (err) {
        log("error: " + JSON.stringify(data));
    	_resp.error(data);
    } else {
        log(data);
    	_resp.success(data);
    }
};

function promiseQuery(query) {
    d = Q.defer();
    var cb = function(err, result) {
        if (err) {
            d.reject(new Error(result));
        } else {
            d.resolve(result.DATA);
        }
    };
    query.fetch(cb);
    return d.promise;
}
