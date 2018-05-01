var _resp, _req;
var _record;
var tbl="device_data";
var TOPIC="";
var sampleMessage={
  "request": {
    "FunctionCode": 1,
    "DeviceID": "cb18290d-ad75-45f9-855f-d7685b22d5de",
    "UnitID": 0,
    "StartAddress": 0,
    "AddressCount": 4,
    "Data": [],
    "ModbusHost": "192.168.1.241"
  },
  "response": {
    "Data": [
      true,
      false,
      false,
      false
    ]
  }
};

function _processResponseMessages(req, resp){
    TOPIC=ClearBlade.edgeId() + "/modbus/command/response/_platform";
    ClearBlade.init({request:req});
    log(req);
    var dbvalues={};
    _resp=resp;
    _req=req;
    var body=JSON.parse(req.params.body);
    //var body=sampleMessage; //debugging
    log(body);

    dbvalues.timestamp=new Date(Date.now()).toISOString();
    dbvalues.deviceid=body.request.DeviceID; //Lookup device
    
    //g_deleteMessages(req.params.topic); //Clean up old data
    //Database mapping
    if (body.request.FunctionCode==MBFUNCTION.READCOIL) {
        type="coils";
    } 
    else if (body.request.FunctionCode==MBFUNCTION.READINPUT) {
        type="inputs";
    }
    else if (body.request.FunctionCode==MBFUNCTION.READHOLDINGREGISTERS) {
        type="holding_registers";
    }
    else if (body.request.FunctionCode==MBFUNCTION.READINPUTREGISTERS) {
        type="input_registers";
        delete dbvalues.timestamp;
    }
    dbvalues[type]=JSON.stringify(body.response.Data); //Add the data type to the object
    processRecord(tbl, dbvalues, type); //Process the record based on type
}

//Process Record
function processRecord(tbl, dbvalues, type) {
    log("processRecord");
    log(dbvalues)
    var msg = ClearBlade.Messaging();
    findDeviceRecord(tbl, dbvalues)
        .then(function(result) {
            if(result.length>0) {
                log(result);
                if (result[0][type] != dbvalues[type]) {//Update if the data has changed
                    var msg = ClearBlade.Messaging();
                    msg.publish(TOPIC, JSON.stringify(dbvalues));
                    updateRecord(tbl, result[0].item_id, dbvalues); 
                    _resp.success("Update");
                }
                else
                    _resp.success("No Update");
            }
            else {
                createRecord(tbl,dbvalues);
            }
        })
        .catch(function(e) {
            log('find error');
        });
}

//Update an existing record
function updateRecord(TABLE, itemID, values) {
    log("updateRecord");
    var query = ClearBlade.Query({collectionName:TABLE});
    query.equalTo('item_id', itemID);
    query.update(values, statusCallBack);
}

//Create a record
function createRecord(TABLE, values) {
    var col = ClearBlade.Collection( {collectionName: TABLE } );
    col.create(values, statusCallBack);
}

/*** 
 * findRecord returns the record matching the device id
 * passed in the values object
 * 
 */
function findDeviceRecord(tbl, values) {
    log("findRecord");
    var query = ClearBlade.Query({collectionName: tbl});
    query.equalTo('deviceid', values.deviceid);
    d = Q.defer();
	query.fetch(function(err, result) {
        if (err) {
            d.reject(new Error(err));
        } else {
            if(result.DATA)
                d.resolve(result.DATA);
            else
                return null;
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

function generateBitCode(data) {
    var s="";
    data.forEach(function(i){
    if(i)
        s="1" + s;
    else
        s="0" + s;
    });
    return parseInt(s, 2);
}
