// Plugin definition.
$.fn.customTable = function( options ) {
    var th=$.map( options.columnsName, function( val, i ) {
        return ($('<th/>').text(val));
    });
    var tr=$("<tr/>");
    tr.append(th);
    var thead=$("<thead/>");
    thead.append(tr);

    $(this).prepend(thead);
    return $(this).DataTable({
        responsive: true,
        deferRender: true,
        processing: true,
        serverSide: true,
        order:options.order,
        columnDefs:options.columnDefs,
        ajax: {
            dataType: "json",
            url: options.url,
            data:function(d){
                var r={};

                $(options.customValue).each(function(x,i){
                    for (const [key, value] of Object.entries(this)) {
                        r[key]=(typeof value === 'function')?value.call():value;
                    }
                });



                r.sortField=d.columns[d.order[0].column].data;
                r.typeSort= d.order[0].dir==='asc'?1:-1;
                r.limit=d.length;
                r.fieldName=options.fieldName;
                r.value=d.search.value;
                r.skip=d.start;
                return r;

            },
            dataSrc:function(d){
                $(options.map).each(function(m){
                    var mapper=this;
                    var mapperKeys=Object.keys(mapper);
                    $(mapperKeys).each(function(ma){
                        var key=this;

                        $(d.data).each(function(i){
                            this[key]=mapper[key](this[key]);

                        });
                    });
                    
                });
                return d.data;
                
            }
        },
        columns: options.columns,
        language: {
            searchPlaceholder: options.placeHolder
        }
    });

};


