/*
*  ��ɫ��js
* */

// ��ʾɾ����ɫʱ��ȷ��ģ̬��
function showConfirmModal(roleArray){
    $("#confirmModel").modal("show")

    let $roleNameDiv=$("#roleNameDiv")
    // �����ǰ������
    $roleNameDiv.empty()

    // ȫ�������Ž�ɫid
    window.roleIdArray=[]

    // ��ʾҪɾ���Ľ�ɫ����
    for (let i=0;i<roleArray.length;i++){
        let role=roleArray[i];
        let roleName = role.roleName;
        $roleNameDiv.append(roleName+"<br/>")

        window.roleIdArray.push(role.roleId)
    }
}

/*���ɷ�ҳҳ��*/
function generatePage() {

    // 1.��ȡ��ҳ����
    let pageInfo=getPageInfoRemote();

    // 2.�����
    fillTableBody(pageInfo)

    // ÿ�η�ҳʱȫѡ��ťΪfalse
    $("#sumBox").prop("checked",false);
}

/*��ȡpageInfo����*/
function getPageInfoRemote(){
    let ajaxResult=$.ajax({
        url:"role/get/page/info.json",
        type:"post",
        data:{
            pageNum:window.pageNum,
            pageSize:window.pageSize,
            keyword:window.keyword
        },
        async:false,
        dataType:"json"
    })
    //console.log(ajaxResult)
    // ��Ӧ״̬��
    let statusCode=ajaxResult.status

    // ��Ӧʧ��
    if (statusCode!==200){
        layer.msg("failed! statusCode="+statusCode+" message="+ajaxResult.statusText)
        return null;
    }

    // ��ȡresultEntity
    let resultEntity = ajaxResult.responseJSON;
    let result = resultEntity.result;
    if (result==="FAILED"){
        layer.msg(resultEntity.message)
    }

    // ����pageInfo
    return resultEntity.data;
}

/*�����*/
function fillTableBody(pageInfo){

    // ���tbody�еľ�����
    let $rolePageBody = $("#rolePageBody");
    $rolePageBody.empty();
    $("#Pagination").empty();

    // �ж�pageInfo�Ƿ���Ч
    if (pageInfo===null||pageInfo===undefined||pageInfo.list===null||pageInfo.list.length===0){
        $rolePageBody.append("<tr><td colspan='4' align='center'>��Ǹ��û�в�ѯ����Ҫ������!</td></tr>")
        return ;
    }
    // ���tbody
    for (let i=0;i<pageInfo.list.length;i++){
        let role=pageInfo.list[i];
        let roleId=role.id;
        let roleName=role.name;

        let numberTd="<td>"+(i+1)+"</td>";
        let checkboxTd="<td><input id='"+roleId+"' class='itemBox' type='checkbox'></td>";
        let roleNameTd="<td>"+roleName+"</td>"
        let checkBtn="<button id='"+roleId+"' type='button' class='checkBtn btn btn-success btn-xs'><i class=' glyphicon glyphicon-check'></i></button>";
        let pencilBtn="<button type=\"button\" class=\"btn btn-primary btn-xs\"><i id='"+roleId+"' class=\" glyphicon glyphicon-pencil\"></i></button>";
        let removeBtn="<button type=\"button\" class=\"btn btn-danger btn-xs\"><i id='"+roleId+"' class=\" glyphicon glyphicon-remove\"></i></button>";
        let buttonTd="<td>"+checkBtn+" "+pencilBtn+" "+removeBtn+"</td>"
        let tr="<tr>"+numberTd+checkboxTd+roleNameTd+buttonTd+"</tr>"

        $rolePageBody.append(tr);

        // ����ҳ�뵼����
        generateNavigator(pageInfo)
    }
}

/*����ҳ�뵼����*/
function generateNavigator(pageInfo) {
    // �ܼ�¼��
    let total=pageInfo.total;

    //����json����洢PaginationҪ���õ�����
    let properties={
        num_edge_entries: 3,                                // ��Եҳ
        num_display_entries: 5,                             // ����ҳ
        callback: paginationCallBack,                       // ��ҳ��ť
        items_per_page: pageInfo.pageSize,                  // ÿҳ��ʾ������
        current_page: pageInfo.pageNum-1,                   // ��ǰҳ
        prev_text: "��һҳ",
        next_text: "��һҳ"
    };

    //����ҳ�뵼����
    $("#Pagination").pagination(total,properties);
}

/*��ҳʱ�Ļص�����*/
function paginationCallBack(pageIndex,jQuery){

    // pageNum
    window.pageNum=pageIndex+1;

    generatePage();

    //ȡ��������Ĭ����Ϊ
    return false;
}

// ����Ȩ����
function fillAuthTree(){
    $.ajax({
        url:"assign/get/all/auth.json",
        type:"post",
        dataType: "json",
        success:function (response){
            let result = response.result;
            if (result==="SUCCESS"){
                // ���Ľڵ�
                let authList = response.data;
                let setting={
                    data:{
                        simpleData: {
                            enable:true,
                            pIdKey:"categoryId",
                        },
                        key:{
                            name:"title"
                        },
                    },
                    check:{
                        enable: true,
                    }
                };

                // �������νṹ
                $.fn.zTree.init($("#treeAuth"),setting,authList);
                // չ���ڵ�
                let zTreeObj = $.fn.zTree.getZTreeObj("treeAuth");
                zTreeObj.expandAll(true);
                // ��ѡ���Ȩ�޻���
                getAssignedAuthIdByRoleId(zTreeObj)
            }
            else if(result==="FAILED"){
                layer.msg("����ʧ�ܣ�"+response.message)
            }
        },
        error:function (response){
            layer.msg(response.status+" "+response.statusText)
        },
    });
}

// ��ȡ��ɫ�ѷ����Ȩ��
function getAssignedAuthIdByRoleId(zTreeObj){
    $.ajax({
        url:"assign/getAssigned/authId/byRoleId.json",
        data:{
            roleId:window.roleId
        },
        type:"post",
        dataType:"json",
        //async:false,
        success:function (response){
            let result = response.result;
            if (result==="SUCCESS"){
                let authIdArray = response.data;
                for (let i=0;i<authIdArray.length;i++){
                    let authId=authIdArray[i];
                    // ����id���Ӧ��node
                    let treeNod = zTreeObj.getNodeByParam("id",authId);
                    // ��treeNode���ù�ѡ
                    let checked=true;  // ��ѡ
                    let checkTypeFlag=false;  // ������
                    zTreeObj.checkNode(treeNod,checked,checkTypeFlag);
                }
            }
            else if(result==="FAILED"){
                layer.msg("����ʧ�ܣ�"+response.message)
            }
        },
        error:function (response){
            layer.msg(response.status+" "+response.statusText)
        },
    })
}

