var INTEGRATIONTABLE="integration_lookup";

function integration_lookup(req, resp){
    ClearBlade.init({request:req});
    r=req.params;
    var q=ClearBlade.Query({collectionName:INTEGRATIONTABLE});
    if (r.locationid){
        q.equalTo("location_uuid", r.locationid);
    }
    if (r.deviceid){
        q.equalTo("device_uuid", r.device_uuid);
    }
    if (r.edgeid){
        q.equalTo("edgeid", r.edgeid);
    }
    
    promiseQuery(q).then(function(r){
        resp.success(r);
    })
    .catch(function(err) {
        resp.error(err);
    });
}

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