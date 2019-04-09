

// Function to convert to log titers
function convert2log(titer){

    var lessthan = titer.substring(0,4) == "&lt;";
    var morethan = titer.substring(0,4) == "&gt;";

    if(lessthan){
        titer = titer.replace("&lt;", "");
        titer = Number(titer);
        titer = titer / 2;
    } else if(morethan){
        titer = titer.replace("&gt;", "");
        titer = Number(titer);  
        titer = titer * 2;
    } else {
        titer = Number(titer);
    }
    
    var log_titer = Math.log2(titer/10);
    return(log_titer);

}


// Function to mix colors
function colMix(scale) {

    if(scale > 1) scale = 1;
    if(scale < 0) scale = 0;

    var cols = [
        [51,  204, 255],
        [255, 204, 102],
        [255, 0,   0]
    ];

    var scale_point = (cols.length-1)*scale;
    var floor = Math.floor(scale_point);
    var ceil  = Math.ceil(scale_point);

    var col;
    if(floor == ceil){
        col = cols[floor];
    } else {
        prop = scale_point - floor;
        col = [
            cols[floor][0]*(1-prop) + cols[ceil][0]*(prop),
            cols[floor][1]*(1-prop) + cols[ceil][1]*(prop),
            cols[floor][2]*(1-prop) + cols[ceil][2]*(prop)
        ];
    }

    return("rgb("+col[0].toFixed(0)+","+col[1].toFixed(0)+","+col[2].toFixed(0)+")");

}



// --------- HItable object constructor ----------
function HItable(
    table_name = null,
    antigen_names,
    sera_names, 
    titers
    ) {

    // Generate log titers
    var logtiters = [];
    for(var i=0; i<titers.length; i++){
        logtiters.push([]);
        for(var j=0; j<titers[0].length; j++){
            if(titers[i][j] == "" || titers[i][j] == "*"){
                titers[i][j] = "";
                logtiters[i].push(NaN);
            } else {
                logtiters[i].push(convert2log(titers[i][j]));
            }
        }
    }

    // Generate column bases
    var colbases = [];
    var colbase;
    for(var i=0; i<sera_names.length; i++){
        colbase = null;
        for(var j=0; j<antigen_names.length; j++){
            if(colbase == null || logtiters[j][i] > colbase){
                colbase = logtiters[j][i];
            }
        }
        colbases.push(colbase);
    }

    // Make antigen objects
    this.antigens = [];
    for(var i=0; i<antigen_names.length; i++){
        this.antigens.push({
            name: antigen_names[i],
            titers: [],
            titercells: []
        });
    }

    // Make sera objects
    this.sera = [];
    for(var i=0; i<sera_names.length; i++){
        this.sera.push({
            name: sera_names[i],
            colbase: colbases[i],
            titers: [],
            titercells: []
        });
    }

    // Make titer objects
    this.titers = [];
    for(var i=0; i<titers.length; i++){
        this.titers.push([]);
        for(var j=0; j<titers[0].length; j++){
            var titer = {
                serum: this.sera[j],
                antigen: this.antigens[i],
                titer: titers[i][j],
                logtiter: logtiters[i][j]
            }
            this.titers[i].push(titer);
            this.sera[j].titers.push(titer);
            this.antigens[i].titers.push(titer);
        }
    }

    // Make an overall div for the HI table
    this.html = document.createElement("div");

    // Make a title div
    if(table_name !== null){
        this.title = document.createElement("div");
        this.html.appendChild(this.title);
        this.title.innerHTML = table_name;
        this.title.classList.add("title");
    }
  
    // Make a div wrapper for the table
    this.wrapper = document.createElement("div");
    this.html.appendChild(this.wrapper);
    this.wrapper.style.backgroundColor = "#eeeeee";

    // Make the html table
    this.table = document.createElement("table");
    this.table.style.borderCollapse = "collapse"; 

    this.wrapper.appendChild(this.table);
    for(var i=0; i<this.antigens.length+1; i++){
        var row = document.createElement("tr");
        this.table.appendChild(row);
        for(var j=0; j<this.sera.length+1; j++){

            // Cell
            var cell = document.createElement("td");
            row.appendChild(cell);

            // Style cell
            cell.style.wordBreak = "break-all";
            cell.style.padding = 0; 
            cell.style.overflow = "hidden";

            // Add properties
            cell.selected    = false;
            cell.highlighted = 0;
            cell.hovered     = false;

            // Div wrapper
            cell.wrapper = document.createElement("div");
            cell.appendChild(cell.wrapper);
            cell.wrapper.style.boxSizing = "border-box";
            cell.wrapper.style.position = "relative";

            // Div
            cell.div = document.createElement("div");
            cell.wrapper.appendChild(cell.div);
            cell.div.style.position = "absolute";
            cell.div.style.right  = 0;
            cell.div.style.top    = 0;
            cell.div.style.minHeight = "100%";
            cell.div.style.minWidth  = "100%";

            // Text
            cell.text = document.createElement("div");
            cell.div.appendChild(cell.text);

            // Add links to antigen, sera and titer objects
            if(i == 0 && j == 0) {

                // Corner cell
                this.topleftcell = cell;
                cell.type = "corner-cell";
                cell.div.innerHTML = "";
                
                this.info = {};
                this.info.div = document.createElement("div");
                cell.div.appendChild(this.info.div);
                this.info.div.style.position = "absolute";
                this.info.div.style.fontSize = 12+"px";
                this.info.div.style.top = 10+"px";
                this.info.div.style.left = 10+"px";
                this.info.div.style.color = "#cccccc";
                this.info.div.style.fontWeight = "bolder";
                this.info.div.style.lineHeight = "16px";
                
                this.info.agdiv = document.createElement("div");
                this.info.div.appendChild(this.info.agdiv);
                this.info.agnum = document.createElement("span");
                this.info.agnum.innerHTML = this.antigens.length;
                this.info.agdiv.appendChild(this.info.agnum);
                var antigentext = document.createElement("span");
                antigentext.innerHTML = " Antigens";
                this.info.agdiv.appendChild(antigentext);

                this.info.srdiv = document.createElement("div");
                this.info.div.appendChild(this.info.srdiv);
                this.info.srnum = document.createElement("span");
                this.info.srnum.innerHTML = this.sera.length;
                this.info.srdiv.appendChild(this.info.srnum);
                var seratext = document.createElement("span");
                seratext.innerHTML = " Sera";
                this.info.srdiv.appendChild(seratext);

            } else if(i == 0) {

                // Serum label
                this.sera[j-1].cell = cell;
                cell.serum = this.sera[j-1];
                cell.text.innerHTML = this.sera[j-1].name;
                cell.div.style.writingMode = "vertical-rl";
                cell.classList.add("serum-cell");
                cell.type = "serum-cell";
                cell.onhover = function(){
                    this.highlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].highlight();
                    }
                }
                cell.ondehover = function(){
                    this.dehighlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].dehighlight();
                    }
                }


            } else if(j == 0) {

                // Antigen label
                this.antigens[i-1].cell = cell;
                cell.antigen = this.antigens[i-1];
                cell.text.innerHTML = this.antigens[i-1].name;
                cell.classList.add("antigen-cell");
                cell.type = "antigen-cell";
                cell.onhover = function(){
                    this.highlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].highlight();
                    }
                }
                cell.ondehover = function(){
                    this.dehighlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].dehighlight();
                    }
                }

            } else {

                // Titer
                this.titers[i-1][j-1].cell = cell;
                this.antigens[i-1].titercells.push(cell);
                this.sera[j-1].titercells.push(cell);
                cell.text.innerHTML = this.titers[i-1][j-1].titer;
                cell.type = "titer-cell";
                cell.antigen = this.antigens[i-1];
                cell.serum   = this.sera[j-1];
                if(this.titers[i-1][j-1].titer == ""){
                    cell.div.classList.add("missing-titer");
                }
                cell.onhover = function(){
                    this.highlight();
                    this.antigen.cell.highlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].highlight();
                    }
                    this.serum.cell.highlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].highlight();
                    }
                }
                cell.ondehover = function(){
                    this.dehighlight();
                    this.antigen.cell.dehighlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].dehighlight();
                    }
                    this.serum.cell.dehighlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].dehighlight();
                    }
                }

            }

            // Add event listeners to everything but corner cell
            if(cell.type != "corner-cell"){

                // A bit complicated in order to detect mouseover on parent element but not children
                cell.addEventListener("mousemove", function(e){
                    var overflow_x = this.div.offsetWidth - this.offsetWidth;
                    if(e.offsetX + 1 >= overflow_x && e.offsetX - 1 <= this.offsetWidth + overflow_x && e.offsetY - 1 <= this.offsetHeight){
                        if(!this.hovered){
                            this.hovered = true; 
                            this.hover();
                        }
                    } else {
                        if(this.hovered){ 
                            this.hovered = false;
                            this.dehover();
                        }
                    }
                });
                cell.addEventListener("mouseleave", function(e){
                    if(this.hovered){ 
                        this.hovered = false;
                        this.dehover();
                    }
                })
                cell.addEventListener("mouseup", function(e){
                    this.click();
                })

            }

            // Add events
            cell.hover = function(){
                this.div.classList.add("hovered");
                this.style.overflow = "visible";
                this.div.style.zIndex   = 10;
                this.onhover();
            }
            cell.dehover = function(){
                this.div.classList.remove("hovered");
                this.style.overflow = "hidden";
                this.div.style.zIndex = null;
                this.ondehover();
            }

            cell.highlight = function(){
                this.highlighted++;
                this.div.classList.add("highlighted");
            }
            cell.dehighlight = function(){
                this.highlighted--;
                if(this.highlighted == 0){
                    this.div.classList.remove("highlighted");
                }
            }

            cell.hide = function(){
                this.classList.add("hidden");
            }
            cell.show = function(){
                this.classList.remove("hidden");
            }

            cell.select = function(){
                this.selected = true;
                this.div.classList.add("selected");
                if(this.antigen){
                    this.antigen.cell.highlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].highlight();
                    }
                }
                if(this.serum){
                    this.serum.cell.highlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].highlight();
                    }
                }
            }
            cell.deselect = function(){
                this.selected = false;
                this.div.classList.remove("selected");
                if(this.antigen){
                    this.antigen.cell.dehighlight();
                    for(var i=0; i<this.antigen.titercells.length; i++){
                        this.antigen.titercells[i].dehighlight();
                    }
                }
                if(this.serum){
                    this.serum.cell.dehighlight();
                    for(var i=0; i<this.serum.titercells.length; i++){
                        this.serum.titercells[i].dehighlight();
                    }
                }
            }

            cell.click = function(){
                if(this.selected) this.deselect();
                else              this.select();
            }

        }
    }


    // Add corner controls
    this.btns = {};

    // Antigen and sera search boxes
    function generateSearchBox(hitable, placeholder, type){

        var input = document.createElement("input");
        input.placeholder = placeholder;
        input.hitable = hitable;
        input.style.width = 120+"px";
        input.style.borderStyle = "none";
        input.spellcheck = false;
        hitable.search[type] = input;
        input.addEventListener("input", function(){
            this.hitable.searchStrains( this.hitable.search.ag.value, this.hitable.search.sr.value );
        });
        return(input);

    }

    this.search = {};
    this.search.div = document.createElement("div");
    this.topleftcell.div.appendChild(this.search.div);
    this.search.div.style.position = "absolute";
    this.search.div.style.top = 46+"px";
    this.search.div.style.left = 8+"px";
    this.search.div.style.display = "none";
    this.search.div.appendChild( generateSearchBox(this, "Sera",     "sr") );
    this.search.div.appendChild( generateSearchBox(this, "Antigens", "ag") );

    // Button generation
    function generateBtn(hitable, content, method, btnstyle){

        var btn = document.createElement("div");
        btn.style.display = "inline-block";
        btn.style.verticalAlign = "bottom";
        btn.classList.add("control-btn");
        btn.innerHTML = content;
        btn.hitable = hitable;
        if(typeof(btnstyle) !== "undefined"){
            Object.assign(btn.style, btnstyle);
        }
        btn.addEventListener("mouseup", function(){ this.hitable[method](); });
        hitable.btns[method] = btn;
        return(btn);

    }
    
    // General controls
    var general_controls = document.createElement("div");
    this.topleftcell.div.appendChild(general_controls);
    general_controls.style.position = "absolute";
    general_controls.style.bottom = 8+"px";
    general_controls.style.left = 8+"px";
    general_controls.appendChild( generateBtn(this, "<", "toggleNumericLessThan",   { width:"18px", height:"18px", paddingTop: "5px" }) );
    general_controls.appendChild( generateBtn(this, "|", "toggleSearchBox",         { width:"18px", height:"18px", paddingTop: "6px" }) );
    general_controls.appendChild( generateBtn(this, "H", "toggleHighlightMaxTiter", { width:"18px", height:"18px", paddingTop: "6px" }) );
    general_controls.appendChild( generateBtn(this, "C", "toggleTiterColor",        { width:"18px", height:"18px", paddingTop: "6px" }) );

    // Color slider
    this.btns.col_slider = document.createElement("input");
    general_controls.appendChild(this.btns.col_slider);
    this.btns.col_slider.classList.add("slider");
    this.btns.col_slider.type = "range";
    this.btns.col_slider.min = 0;
    this.btns.col_slider.max = 1;
    this.btns.col_slider.setAttribute("value", 0.5);
    this.btns.col_slider.step = 0.01;
    this.btns.col_slider.style.width = 60+"px";
    this.btns.col_slider.style.marginBottom = 6+"px";
    this.btns.col_slider.style.marginLeft = 4+"px";
    this.btns.col_slider.style.display = "none";
    this.btns.col_slider.hitable = this;
    this.btns.col_slider.addEventListener("input", function(){
        this.hitable.settings.titerColAdjustment = this.value;
        this.hitable.updateTiterColor();
    });

    // Text controls
    var text_controls = document.createElement("div");
    this.topleftcell.div.appendChild(text_controls);
    text_controls.style.position = "absolute";
    text_controls.style.top = 8+"px";
    text_controls.style.right = 8+"px";
    text_controls.appendChild( generateBtn(this, "T", "decreaseFontSize",       { fontSize:"8px",  paddingTop:"5px"   }) );
    text_controls.appendChild( generateBtn(this, "T", "increaseFontSize",       { fontSize:"12px", paddingTop:"4.5px" }) );
    text_controls.appendChild( generateBtn(this, "<s>T</s>", "toggleTiterText", { fontSize:"12px", paddingTop:"4.5px" }) );

    // Col controls
    var col_controls = document.createElement("div");
    this.topleftcell.div.appendChild(col_controls);
    col_controls.style.position = "absolute";
    col_controls.style.top = 28+"px";
    col_controls.style.right = 8+"px";
    col_controls.appendChild( generateBtn(this, "-", "decreaseColWidth") );
    col_controls.appendChild( generateBtn(this, "+", "increaseColWidth") );

    // Row controls
    var row_controls = document.createElement("div");
    this.topleftcell.div.appendChild(row_controls);
    row_controls.style.position = "absolute";
    row_controls.style.top = 48+"px";
    row_controls.style.right = 8+"px";
    row_controls.appendChild( generateBtn(this, "-", "decreaseRowHeight") );
    row_controls.appendChild( generateBtn(this, "+", "increaseRowHeight") );


    // Add properties
    this.style = {};
    this.settings = {
        coloredByTiter  : false,
        titerTextHidden : false
    }

    // Run methods to set styles
    this.setRownameWidth(180);
    this.setHeaderHeight(120);
    this.setColWidth(60);
    this.setRowHeight(24);
    
    this.setFontSize(12);
    this.setCellPadding(0.5);

    this.setNumericLessThan(true);
    this.setMaxTiterHighlight(false);

}


// ------- Set HItable methods ---------

// Sizing columns and rows
HItable.prototype.resizeWrapper = function(){
    var width  = this.style.rownameWidth + this.style.colWidth*this.sera.length + this.sera.length + 2;
    var height = this.style.headerHeight + this.style.rowHeight*this.antigens.length + this.antigens.length + 2;
    this.wrapper.style.width  = width+"px";
    this.wrapper.style.height = height+"px";
}
HItable.prototype.setRownameWidth = function(width){
    this.style.rownameWidth = width;
    this.topleftcell.wrapper.style.width = width+"px";
    for(var i=0; i<this.antigens.length; i++) {
        this.antigens[i].cell.wrapper.style.width = width+"px";
    }
    this.resizeWrapper();
}

HItable.prototype.setHeaderHeight = function(height){
    this.style.headerHeight = height;
    this.topleftcell.wrapper.style.height = height+"px";
    for(var i=0; i<this.sera.length; i++) {
        this.sera[i].cell.wrapper.style.height = height+"px";
    }
    this.resizeWrapper();
}

HItable.prototype.increaseColWidth = function(){ this.setColWidth( this.style.colWidth + 5 ) }
HItable.prototype.decreaseColWidth = function(){ this.setColWidth( this.style.colWidth - 5 ) }
HItable.prototype.setColWidth = function(width){
    this.style.colWidth = width;
    for(var i=0; i<this.sera.length; i++) {
        this.sera[i].cell.wrapper.style.width = width+"px";
        for(var j=0; j<this.sera[i].titercells.length; j++) {
            this.sera[i].titercells[j].wrapper.style.width = width+"px";
        }
    }
    this.resizeWrapper();
}

HItable.prototype.increaseRowHeight = function(){ this.setRowHeight( this.style.rowHeight + 5 ) }
HItable.prototype.decreaseRowHeight = function(){ this.setRowHeight( this.style.rowHeight - 5 ) }
HItable.prototype.setRowHeight = function(height){
    this.style.rowHeight = height;
    for(var i=0; i<this.antigens.length; i++) {
        this.antigens[i].cell.wrapper.style.height = height+"px";
        for(var j=0; j<this.antigens[i].titercells.length; j++) {
            this.antigens[i].titercells[j].wrapper.style.height = height+"px";
        }
    }
    this.resizeWrapper();
}

// Font sizing
HItable.prototype.increaseFontSize = function(){ 
    this.setFontSize(this.style.fontSize + 1);
}
HItable.prototype.decreaseFontSize = function(){ 
    this.setFontSize(this.style.fontSize - 1); 
}
HItable.prototype.setFontSize = function(fontsize){
    this.style.fontSize = fontsize;
    this.table.style.fontSize = fontsize+"px";
}

// Cell padding
HItable.prototype.setCellPadding = function(padding){
    this.style.padding = padding;
    this.table.style.padding = padding+"em";
    for(var i=0; i<this.antigens.length; i++) this.antigens[i].cell.text.style.padding = padding+"em";
    for(var i=0; i<this.sera.length; i++)     this.sera[i].cell.text.style.padding     = padding+"em";
    for(var i=0; i<this.titers.length; i++) {
        for(var j=0; j<this.titers[i].length; j++) {
            this.titers[i][j].cell.text.style.padding = padding+"em";
        }
    }
}

// Toggle numeric less thans
HItable.prototype.toggleNumericLessThan = function(){
    this.setNumericLessThan(!this.numericLessThan);
}
HItable.prototype.setNumericLessThan = function(numeric_lessthan){
    this.numericLessThan = numeric_lessthan;
    if(numeric_lessthan) this.btns.toggleNumericLessThan.classList.remove("active-btn");
    else                 this.btns.toggleNumericLessThan.classList.add("active-btn");
    for(var i=0; i<this.titers.length; i++){
        for(var j=0; j<this.titers[0].length; j++){
            if(this.titers[i][j].titer.substring(0,4) == "&lt;"){
                if(this.numericLessThan == true) this.titers[i][j].cell.text.innerHTML = this.titers[i][j].titer;
                else                             this.titers[i][j].cell.text.innerHTML = "<";
            }
        }
    }
}

// Toggle text visibility
HItable.prototype.toggleTiterText = function(){
    if(this.settings.titerTextHidden){
        this.settings.titerTextHidden = false;
        this.btns.toggleTiterText.classList.remove("active-btn");
    } else {
        this.settings.titerTextHidden = true;
        this.btns.toggleTiterText.classList.add("active-btn");
    }
    for(var i=0; i<this.titers.length; i++){
        for(var j=0; j<this.titers[0].length; j++){
            if(this.settings.titerTextHidden) {
                this.titers[i][j].cell.text.style.display = "none";
            } else {
                this.titers[i][j].cell.text.style.display = "block";
            }
        }
    }
}

// Search strains
HItable.prototype.toggleSearchBox = function(){
    if(this.search.div.style.display == "none"){
        this.search.div.style.display = "block";
        // this.info.div.style.display = "none";
        this.btns.toggleSearchBox.classList.add("active-btn");
    } else {
        this.search.div.style.display = "none";
        // this.info.div.style.display = "block";
        this.btns.toggleSearchBox.classList.remove("active-btn");
    }
}
HItable.prototype.searchStrains = function(ag_val, sr_val){

    ag_val = ag_val.toLowerCase();
    sr_val = sr_val.toLowerCase();

    var num_antigens = 0;
    for(var i=0; i<this.antigens.length; i++){
        if(this.antigens[i].name.toLowerCase().indexOf(ag_val) == -1 && ag_val != ""){
            this.antigens[i].cell.hide();
        } else {
            this.antigens[i].cell.show();
            num_antigens++;
        }
    }
    this.info.agnum.innerHTML = num_antigens;

    var num_sera = 0;
    for(var i=0; i<this.sera.length; i++){
        if(this.sera[i].name.toLowerCase().indexOf(sr_val) == -1 && sr_val != ""){
            this.sera[i].cell.hide();
        } else {
            num_sera++;
            this.sera[i].cell.show();
        }
    }
    this.info.srnum.innerHTML = num_sera;

    for(var i=0; i<this.titers.length; i++){
        for(var j=0; j<this.titers[0].length; j++){
            var antigen = this.titers[i][j].antigen.name;
            var serum   = this.titers[i][j].serum.name;
            var ag_nomatch = antigen.toLowerCase().indexOf(ag_val) == -1 && ag_val != "";
            var sr_nomatch = serum.toLowerCase().indexOf(sr_val) == -1 && sr_val != "";
            if(ag_nomatch || sr_nomatch){
                this.titers[i][j].cell.hide();
            } else {
                this.titers[i][j].cell.show();
            }
        }
    }

}

// Coloring max titers
HItable.prototype.toggleHighlightMaxTiter = function(){
    this.setMaxTiterHighlight( !this.maxTiterHighlighted );
}
HItable.prototype.setMaxTiterHighlight = function(highlight_max){
    this.maxTiterHighlighted = highlight_max;
    if(highlight_max) this.btns.toggleHighlightMaxTiter.classList.add("active-btn");
    else              this.btns.toggleHighlightMaxTiter.classList.remove("active-btn");
    for(var i=0; i<this.titers.length; i++){
        for(var j=0; j<this.titers[0].length; j++){
            if(this.titers[i][j].logtiter == this.titers[i][j].serum.colbase){
                if(this.maxTiterHighlighted) this.titers[i][j].cell.div.classList.add("highest-titer");
                else                         this.titers[i][j].cell.div.classList.remove("highest-titer");
            }
        }
    }
}


// Coloring by titer
HItable.prototype.toggleTiterColor = function(){
            
    if(this.settings.coloredByTiter) {
        this.btns.col_slider.style.display = "none";
        this.btns.toggleTiterColor.classList.remove("active-btn");
        this.settings.coloredByTiter = false;
        this.updateTiterColor();
    }
    else {
        this.btns.col_slider.style.display = "inline-block";
        this.btns.toggleTiterColor.classList.add("active-btn");
        this.settings.coloredByTiter = true;
        this.updateTiterColor();
    }

}

HItable.prototype.updateTiterColor = function(){

    var color_adjustment = Math.pow(Number(this.btns.col_slider.value) + 0.5, 3);

    for(var i=0; i<this.titers.length; i++){
        for(var j=0; j<this.titers[0].length; j++){
            
            var titer = this.titers[i][j];
            if(!isNaN(titer.logtiter)){
                if(this.settings.coloredByTiter) {
                    var standardised_log = (titer.logtiter + 1) / 10;
                    standardised_log = Math.pow(standardised_log, color_adjustment);
                    titer.cell.div.style.backgroundColor = colMix(standardised_log);
                    titer.cell.div.classList.add("colored");
                }
                else {
                    titer.cell.div.style.backgroundColor = null;
                    titer.cell.div.classList.remove("colored");
                }
            }
        }
    }

}


// Populate the DOM ------------
document.addEventListener("DOMContentLoaded", function(event) { 

    // Cycle through HI tables
    var hitables = document.getElementsByTagName("hitable");
    for(var hitable_num=0; hitable_num<hitables.length; hitable_num++){
        
        // Get table data
        var hitable = hitables[hitable_num];
        var table_name_div = hitable.getElementsByTagName("tablename")[0];
        if(typeof(table_name_div) !== "undefined") var table_name = table_name_div.innerHTML.trim();
        else                                       var table_name = null;
        
        var sera_text    = hitable.getElementsByTagName("sera")[0];
        var antigen_text = hitable.getElementsByTagName("antigens")[0];
        var titer_text   = hitable.getElementsByTagName("titers")[0];

        var sera_names    = sera_text.innerHTML.split("\n");
        var antigen_names = antigen_text.innerHTML.split("\n");
        var titer_data    = titer_text.innerHTML.split("\n");
        
        var sera     = [];
        var antigens = [];
        var titers   = [];
        
        hitable.antigens = antigens;
        hitable.sera     = sera;
        
        // Get sera names
        for(var j=0; j<sera_names.length; j++){
            var serum_name = sera_names[j].trim();
            if(serum_name != ""){
                sera.push(serum_name);
            }
        }

        // Get antigen names
        for(var j=0; j<antigen_names.length; j++){
            var antigen_name = antigen_names[j].trim();
            if(antigen_name != ""){
                antigens.push(antigen_name);
            }
        }

        // Get titers
        for(var j=0; j<titer_data.length; j++){
            var titer_row = titer_data[j].trim();
            if(titer_row != ""){
                
                titer_row_titers = [];
                titer_row_data = titer_row.split("|");
                for(var k=0; k<titer_row_data.length; k++){
                    titer_row_titers.push(titer_row_data[k].trim());
                }
                titers.push(titer_row_titers);

            }
        }

        // Clear content
        hitable.innerHTML = "";

        // Generate the HI object
        var hitableobj = new HItable(
            table_name    = table_name,
            antigen_names = antigens,
            sera_names    = sera, 
            titers        = titers
        )

        // Add to the dom
        hitable.appendChild(hitableobj.html);

    }







    // Add styles -----------
    var style = document.createElement("style");
    document.head.appendChild(style);


    // General table styles
    style.sheet.insertRule(`
        hitable { 
            font-family: sans-serif; 
            display: block; 
            cursor: default; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .title { 
            font-size: 20px; 
            padding: 10px; 
            margin-bottom: 10px; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable table { 
            background-color: #ffffff;
        }
    `, 0);
    style.sheet.insertRule(`
        hitable table td { 
            border: solid 1px #dfe2e5;
        }
    `, 0);

    style.sheet.insertRule(`
        hitable table tr td:nth-child(odd) { 
            background-color: #f6f8fa; 
        }
    `, 0);
    // style.sheet.insertRule(`
    //     hitable table tr:nth-child(odd) td { 
    //         background-color: #f6f8fa; 
    //     }
    // `, 0);


    // Styles for different cell states
    style.sheet.insertRule(`
        hitable .selected { 
            background-color: #39ac73; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .highest-titer { 
            font-weight: bolder; 
            background-color: #cae9af; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .hovered { 
            background-color: #66b3ff; 
            outline: solid 2px #2dbbbb; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .highlighted { 
            background-color: #ccdcff; 
            color: #000000; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .hidden { 
            display: none; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .missing-titer { 
            background-color: #f0f0f0; 
        }`
    , 0);
    style.sheet.insertRule(`
        hitable .highlighted div { 
            opacity: 1; 
            font-weight: bolder; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .colored div { 
            opacity: 0.4; 
        }
    `, 0);


    // Buttons and input styles
    style.sheet.insertRule(`
        hitable input:focus { 
            outline-style: none; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .controls { 
            padding: 6px; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .control-btn { 
            cursor: default; 
            color: #cccccc; 
            padding: 3px; 
            margin: 2px; 
            font-size: 12px; 
            font-weight: bolder; 
            background-color: #eeeeee; 
            width: 14px; 
            height:14px; 
            line-height: 6px; 
            text-align: center; 
            border-radius: 2px; 
            user-select: none; 
            -webkit-user-select: none; 
            -moz-user-select: none; 
            -ms-user-select: none; 
            vertical-align: top; 
            box-sizing: border-box; }
    `, 0);
    style.sheet.insertRule(`
        hitable .control-btn:hover { 
            color: #000000; 
            background-color: #dddddd; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .control-btn.active-btn { 
            background-color: #0088cc; 
            color: #000000; 
        }
    `, 0);
    style.sheet.insertRule(`
        hitable .control-btn.active-btn:hover { 
            background-color: #006699; 
            color: #000000; 
        }
    `, 0);


    // Input slider styles
    style.sheet.insertRule(`
        hitable .slider {
          -webkit-appearance: none;  /* Override default CSS styles */
          appearance: none;
          width: 100%; /* Full-width */
          height: 10px; /* Specified height */
          background: #dddddd; /* Grey background */
          outline: none; /* Remove outline */
          opacity: 0.7; /* Set transparency (for mouse-over effects on hover) */
          -webkit-transition: .2s; /* 0.2 seconds transition on hover */
          transition: opacity .2s;
        }
    `, 0);

    style.sheet.insertRule(`
        /* Mouse-over effects */
        hitable .slider:hover {
          opacity: 1; /* Fully shown on mouse-over */
        }
    `, 0);
    
    style.sheet.insertRule(`
        /* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */ 
        hitable .slider::-webkit-slider-thumb {
          -webkit-appearance: none; /* Override default look */
          appearance: none;
          width: 10px; /* Set a specific slider handle width */
          height: 10px; /* Slider handle height */
          background: #4CAF50; /* Green background */
          cursor: pointer; /* Cursor on hover */
        }
    `, 0);
    
    // Firefox
    // style.sheet.insertRule(`
    //  hitable .slider::-moz-range-thumb {
    //    width: 10px; /* Set a specific slider handle width */
    //    height: 10px; /* Slider handle height */
    //    background: #4CAF50; /* Green background */
    //    cursor: pointer; /* Cursor on hover */
    //  }
    //`, 0);



})


