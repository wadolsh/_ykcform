findServiceModel_searchForm = {
    search_findServiceFindFrom: {
        searchField: "findServiceFindFrom",
        searchComparison : "$regex",
        label: "情報元",
        list: "findServiceFindFromList"
    },
    search_findServiceMapKu: {
        searchField: "findServiceMapKu",
        searchComparison : "$regex",
        label: "地図:市区",
        list: "findServiceMapKuList"
    },
    search_findServiceCityward: {
        searchField: "findServiceAddress2",
        searchComparison : "$regex",
        label: "住所:市区",
        list: "findServiceMapKuList",
        lineBreak: 1
    },
    search_findServiceTown: {
        searchField: "findServiceAddress3",
        searchComparison : "$regex",
        label: "町村",
        list: "townNameList"
    },
    search_fileno: {
        searchField: "fileno",
        searchComparison : "$eq",
        label: "区域番号",
        style: "width:100px;"
    }
}

//var colors = {"#3366cc","#dc3912","#ff9900","#109618","#990099","#0099c6","#dd4477","#66aa00","#b82e2e","#316395","#994499","#22aa99","#aaaa11","#6633cc","#e67300","#8b0707","#651067","#329262","#5574a6","#3b3eac","#b77322","#16d620","#b91383","#f4359e","#9c5935","#a9c413","#2a778d","#668d1c","#bea413","#0c5922","#743411"}
                

findServiceModel_visitResultInfo = {'1' : '〇', '2' : '×'};

findServiceModel_resultTypeModel = {
    '1': {label: '韓国語', color:'btn-success', scolor: '#3366cc'},
    '2': {label: '日本語', color:'btn-info', scolor: '#dc3912'}, 
    '3': {label: '中国語', color:'btn-info', scolor: '#ff9900'}, 
    '4': {label: '他言語', color:'btn-info', scolor: '#109618'}, 
    '-1': {label: 'あいまい', color:'btn-warning', scolor: '#990099'},
    '-2': {label: '住所不明', color:'btn-danger', scolor: '#0099c6'},
    '-3': {label: '引っ越し', color:'btn-warning', scolor: '#dd4477'}, 
    '0': {label: '未設定', color:'btn-default', scolor: '#66aa00'}
};

findServiceModel_isNew = {
    '0': {label: '未設定'},
    1: {label: '新規'},
    2: {label: '既存'}
}