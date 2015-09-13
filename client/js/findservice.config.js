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



findServiceModel_visitResultInfo = {'1' : '〇', '2' : '×'};

findServiceModel_resultTypeModel = {
    '1': {label: '韓国語', color:'btn-success'},
    '2': {label: '日本語', color:'btn-info'}, 
    '3': {label: '中国語', color:'btn-info'}, 
    '4': {label: '他言語', color:'btn-info'}, 
    '-1': {label: 'あいまい', color:'btn-warning'},
    '-2': {label: '住所不明', color:'btn-danger'},
    '-3': {label: '引っ越し', color:'btn-warning'}, 
    '0': {label: '未設定', color:'btn-default'}
};

findServiceModel_isNew = {
    '0': {label: '未設定'},
    1: {label: '新規'},
    2: {label: '既存'}
}