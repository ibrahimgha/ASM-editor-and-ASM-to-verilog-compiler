var output_gentb = "";
function generate_testbench() {
    output_gentb = "";
    var DUT_module_name = $("#DUT").val();
    var verilog_code = $("#verilog").val();
    var tb_module_name = "generated_tb";
    
    var modName = DUT_module_name;
    var tbModName = tb_module_name;
    var timeScale = $("#timescale").val();
    var clocked = $("#clocked").val();
    var clk = $("#clk").val();
    var rst = $("#rst").val();
    var period = $("#period").val();
    
    var modDecl = "";
    
    
    
    output_gentb += "// Automatically Generated Testbench for module "+modName+"\n";
    output_gentb += "// Generated today \n\n";
    output_gentb += "`timescale "+ timeScale +"ns/1ps\n\n";
    
    output_gentb += "module "+tbModName+";\n";
    
    // first construct a string for the module defination
    var flag = 0;
    
    lines_list = verilog_code.split("\n");
    
    for (var i in lines_list) {
	if (flag == 0 && EXEC(/^module/, lines_list[i])) {
	    modDecl += lines_list[i];
	    flag = 1;
	} else if (flag == 1) {
	    modDecl += lines_list[i];
	    if (EXEC(/\x29\x3b/, lines_list[i])) {
		if (modName == getModName(modDecl)) {
		    flag = 2;
		} else{
		    flag = 0;
		}
	    }
	} else{
	    if (EXEC(/endmodule/, lines_list[i])) {
		break;
	    }
	    if (EXEC(/input/, lines_list[i])) {
		//EXEC(/input/reg/g, lines_list[i]);
		output_gentb += lines_list[i] + '\n';
	    }
	    if (EXEC(/output_gentb/, lines_list[i])) {
		//EXEC(/output_gentb/wire/g, lines_list[i]);
		output_gentb += lines_list[i] + '\n';
	    }
	}
    }
    modName = getModName(modDecl);
    output_gentb += '\n';
    output_gentb += modName + " DUT(";
    processPars(modDecl);
    output_gentb += " );\n\n";
    output_gentb += "initial begin\n $dumpfile (\""+modName+".vcd\");\n $dumpvars (2,"+tbModName+");\n #1000 $finish;\t\t//simulate for 1000 ticks only\nend\n\n";
    
    if(clocked == 1){
	output_gentb += "// Clock Generator \ninitial  "+clk+" = 0;\nalways #"+period/2+" $clk = ~"+clk+";\n\n";
	output_gentb += "// Rest Generator goes here\n// Change to match your design\n";
	output_gentb += "initial begin\n "+rst+" = 0;\n @ (negedge "+clk+");\n @ (negedge "+clk+");\n "+rst+" = 1;\nend\n\n";
    }
    output_gentb += "endmodule\n\n";
    
    $("#tb").val(output_gentb);
}

//now get the module name
function getModName(s){
    if(EXEC(/^module\s+([^\s\(]*)/, s)) {
	return /^module\s+([^\s\(]*)/.exec(s)[0];
    } else {
	return "";
    }
}

function processPars(s){
    var cnt = 0;
    var dollar1 = /\(([^\)]+)/.exec(s);
    //print $1;
    for (i in dollar1) {
	//$val =~ s/^\s+//;
	//$val =~ s/\s+$//;
	output_gentb += "." + dollar1[i] + '(' + dollar1[i] + ')';
	cnt += 1;
	if (cnt != dollar1.length) {
	    output_gentb += ", ";
	}
    }
}

function EXEC(reg, text) {
    var arr = reg.exec(text);
    if (arr != null) {
	return true;
    }
    return false;
}
