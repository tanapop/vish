<!DOCTYPE html>
<html lang="en" style="height: 100%">
<head>
<meta charset="UTF-8">
<title>Dali - POC</title>
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.5.0/css/font-awesome.min.css">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css" integrity="sha384-1q8mTJOASx8j1Au+a5WDVnPi2lkFfwwEAa8hDDdjZlpLegxhjVME1fgjWPGmkzs7" crossorigin="anonymous">
<link rel="stylesheet" href="css/style.css">
<link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro" rel="stylesheet" type="text/css">
<link rel="stylesheet" href="/assets/dali_documents/textStyles.css">
    <link rel="stylesheet" href="css/pluginsCss/cajascolor.css">
<script src="http://code.jquery.com/jquery-1.10.2.min.js"></script>
<script src="/assets/lib/jquery-ui.min.js"></script>
<script src="/assets/lib/jquery.ui.touch-punch.min.js"></script>
<script src="/assets/lib/api.js"></script>
<script src="/assets/lib/ckeditor/ckeditor.js"></script>
<script src="/assets/editor/BasePlugin.js"></script>
<script src="plugins.json"></script>
<script src="/assets/lib/visor/visor.js"></script>
<body  style="margin: 0px; height: 100%">
<div style="height:100%;" id="editor truevisor">
<div style="height:100%;" id="root" style="height: 100%">
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.2/js/bootstrap.min.js"></script>
<div class="outter" style="padding-top:0px;">
<div id="maincontent" class="slide <%=navs[page].type == 'slide' ? 'sli':'doc'%>" style="visibility: visible;" >

<%
    var padre = navs[navs[page].parent].name || 'Section 0';
    var patt = /([0-9]+((\.[0-9]+)+)?)/;  //Detecta número de sección. Ej. Section (2.3.4.2)
    var sectiontitle = patt.exec(padre)? patt.exec(padre)[0]:'0';
%>

<div style="visibility: visible; overflow: auto; display: <%=(navs[page].titlesReduced == 'hidden')?'none':'inherit' %>;" class="caja">
    <div class="cab">
        <div class="cabtabla_numero"><%=sectiontitle%></div>
        <div class="tit_ud_cap">
            <h1> Título Curso -  <%strDate%></h1>
            <h2>Título Unidad</h2>
        </div>
        <div class="cabtabla_lapiz">
            <img src="/assets/images/ico_alumno.gif" alt="Alumno"><div id="alumno"> Alumno</div>
        </div>
        <div class="clear"></div>
    </div>

    <div class="contenido" style="height:auto;">
        <!--DALITITLE-->
        <%
        var alltitles = [];
        if (page !== 0) {
            alltitles.push(navs[page].name);
            var parent = navs[page].parent;
            while (parent !== 0) {
                alltitles.push(navs[navs[page].parent].name);
                parent = navs[parent].parent;
            }
            alltitles.reverse();
        }
        if(navs[page].titlesReduced =='reduced') {
            var titles = alltitles;
            var actualTitle = titles.pop();
            unidad=titles[0];
        %>
        <div>
            <h3>
                <ol class="breadcrumb" style="margin:0; background-color:inherit;">
                    <%titles.map(function(item, index){
                    if(index != 0){%>
                    <li><a href="#"><%=item%></a></li>
                    <%}}) %>
                </ol>
            </h3>
            <h4 style="margin: 0"><%=actualTitle%></h4>
        </div>
        <%}else if(navs[page].titlesReduced=='expanded') {
            var titlesComponents = "";
            alltitles.map(function(text, index){
                if (index == 0) {
                    unidad=text;
                } else {
                    let nivel = index+2;
                    if (nivel > 6){
                        nivel = 6;
                    }
                    titlesComponents += "<h" + (nivel) + " style=\"margin-top: 16px\">" + text + "</h" + (nivel) + ">";
                }
            }); %>
        <%=titlesComponents%>
        <%}%>

        <div class="boxes" style="position:relative;">

            <!--Camel Case -->
            <%function camel(s) {
                if(s=='onClick'){
                    return 'onclick';
                }
                return s.split(/(?=[A-Z])/).join('-').toLowerCase();
            }%>

            <!-RENDER CHILDREN->
            <%function renderChildren(id, markup, key){
                if(typeof markup === "string"){%>
                    <%= markup %>
                <%   return;
                }
                var component;
                var props = {};
                var children;
                switch (markup.node) {
                    case 'element':
                        if(markup.attr){
                            props = markup.attr;
                        }
                        props.key = key;
                        if(markup.tag === 'plugin'){
                            pluginplaceholder(props, markup.attr["plugin-data-id"], id)
                        }else{
                            component = markup.tag;
                            var attributes = "";
                            for (prop in props){
                                var value = props[prop]
                                if (prop == "style"){
                                    value = "";
                                    for (style in props[prop]){
                                        value += camel(style) + ": " + props[prop][style] + "; ";
                                    }
                                }
                                attributes += camel(prop) + "=\"" + value + "\" ";
                            } %>
                            <%="<" + component + " " %><%=attributes%><%=">"%>
                            <% if(markup.child) {
                                markup.child.forEach(function (child, index) {
                                    renderChildren(id, child, index);
                                });
                            }%>
                            </<%=component%>>
                        <% }
                        break;
                    case 'text':%>
                        <%= markup.text%>
                        <% break;
                    case 'root': %>
                        <div style="width:100%; height:100%;">
                        <% if (markup.child) {
                            markup.child.forEach(function(child, index){
                                renderChildren(id, child, index);
                            });
                        } %>
                        </div>
                        <% break;
                }
            };%>

        <!-VISORDALIBOX->
        <%function daliBox(id) {
            var borderSize = 2;
            var cornerSize = 15;
            var box = boxesById[id];
            var toolbar =  toolbarsById[id];
            var style = "width: 100%; height: 100%; position: relative; word-wrap: break-word;";
            var attrs = " ";

            if(toolbar.buttons) {
                toolbar.buttons.map(function(item, index){
                    if (item.autoManaged) {
                        if (!item.isAttribute) {
                            if(item.name !== 'width' && item.name !== 'height') {
                                style += " " + camel(item.name ) + " : " + item.value;
                                if (item.units){
                                    style += item.units;
                                }
                                style+="; ";
                            }
                        }else {
                            attrs += 'data-' + item.name +"= " + item.value +" "
                        }
                    }
                });
            };%>
            <div class="wholebox"
                 style="position: absolute;
                         left: <%=box.position.x%>px;
                         top: <%=box.position.y%>px;
                         width: <%=box.width %><%=(box.width  && isNaN(box.width ))? "" : "px" %>;
                         height: <%=box.height%><%=(box.height && isNaN(box.height))? "" : "px" %>;
                         cursor:  default ;"  >

                <div style="<%= style%>"  <%= attrs%> >
                    <%renderChildren(id, Dali.Visor.Plugins.get(toolbar.config.name).export(toolbar.state, toolbar.config.name, box.children.length !== 0), 0)%>
                </div>
            </div>
        <%}%>

        <!-- VISORDALIBOXSORTABLE-->
        <%function daliBoxSortable(id){
            var box = boxesById[id]; %>
            <div>
                <div ref="sortableContainer"  style="position: relative;" >
                <%box.children.map(function(idContainer, index){
                    var container = box.sortableContainers[idContainer];%>
                    <div class="daliBoxSortableContainer"
                         data-id="idContainer"
                         style="
                  width: 100%;
                  min-height: 150px;
                  height: <%=container.height%><%=(container.height && isNaN(container.height))? "" : "px" %>; 
                  box-sizing: border-box;
                  position: relative;">

                        <%container.colDistribution.map(function(col, i){
                            if(container.cols[i]) { %>
                                <div style="width: <%=col%>%; height: 100%; float: left;">
                                <%container.cols[i].map(function(row, j){ %>
                                    <div style="width: 100%; height: <%=row%>%; position: relative;"  >
                                    <%container.children.map(function(idBox, index){
                                        if(boxesById[idBox].col === i && boxesById[idBox].row === j) {
                                            daliBox(idBox);
                                        }
                                    })%>
                                    </div>
                                <%})%>
                                </div>
                        <%}})%>
                    </div>
                <%})%>
                </div>
            </div>
        <%}%>

        <!--PLUGIN PLACEHOLDER -->
        <%function pluginplaceholder(props, pluginContainer, parentBox) {
            var container = boxesById[parentBox].sortableContainers[pluginContainer];%>
            <div style=" width: 100%; height: 100%; position: relative;" class="<%= pluginContainer%>" >
            <%if(container){
                container.colDistribution.map(function(col, i){
                    if(container.cols[i]){%>
                        <div style="width: <%=col%>%; height: 100%; float: left;">
                        <%container.cols[i].map(function(row, j){ %>
                            <div style="width: 100%; height: <%=row %>%; position: relative;">
                            <%container.children.map(function(idBox, index){
                                if(boxesById[idBox].col === i && boxesById[idBox].row === j) {
                                    daliBox(idBox )
                                }
                            })%>
                            </div>
                        <%})%>
                        </div>
                <%}})
            }else{%>
              <div style="width: 100%; height: 100%;"></div>
            <%}%>
            </div>
        <%}%>

        <%navs[page].boxes.map(function(id){
            var box = boxesById[id];
            if(box.type === 'normal'){
                daliBox(box.id);
            }else if(box.type === 'sortable') {
                daliBoxSortable(box.id )
        }})%>
    </div>
</div>
</div>
</div>
</div>
</div>
</div>
</body>
</html>