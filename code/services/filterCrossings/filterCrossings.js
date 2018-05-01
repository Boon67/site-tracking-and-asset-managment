var TABLE="rail_crossings";
function filterCrossings(req, resp){
    ClearBlade.init({request:req});
    r=req.params;
    if (!r.railroad)
        r.railroad="BNSF";
    var q=ClearBlade.Query({collectionName:TABLE});
    if (r.railroad){
        q.equalTo("railroad", r.railroad);
    }

    promiseQuery(q).then(function(r){
        results={};
        /*r.forEach(function(f) {
            results[f.item_id]=f;
            
        });*/
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