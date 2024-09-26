function hideBPF(executionContext){
        var formContext = executionContext.getFormContext();
        var leadType = formContext.getControl("chi_leadtype");
        var leadTypeValue = formContext.getAttribute("chi_leadtype").getValue();
        if(leadTypeValue == 126720000){
            Xrm.Page.ui.process.setVisible(false);
        }
        
}