function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100)
        , seconds = parseInt((duration/1000)%60)
        , minutes = parseInt((duration/(1000*60))%60)
        , hours = parseInt((duration/(1000*60*60))%24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}
function arrayToString(array){
    return array.join(', ');
}
function findMinMax(vect){
    if(!vect){
        return {};
    }
    if(vect.length==1){
        return {
            min:vect[0],max:vect[0]
        }
    }
    var min=vect[0];
    var max=vect[0];
    for(var i=1;i<vect.length;i++){
        if(vect[i]<min){
            min=vect[i];
        }
        if(vect[i]>max){
            max=vect[i];
        }
    }
    return {
        min:min,max:max
    };
}