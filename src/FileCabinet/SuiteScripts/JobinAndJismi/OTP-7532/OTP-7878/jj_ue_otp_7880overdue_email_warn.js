/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 * @author      JobinAndJismi IT Services LLP
 * @Date        September 24, 2024
 * @Title       Overdue warning
 * @JiraCode    OTP-7880
 */
define(['N/runtime', 'N/currentRecord', 'N/search', 'N/email'],
     function(runtime, currentRecord, search, email) {
    
        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        const beforeLoad = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const beforeSubmit = (scriptContext) => {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        const afterSubmit = (scriptContext) => {
            
           let newRecord = scriptContext.newRecord;
           let customerId  = newRecord.getValue('entity');

           let overdue = search.lookupFields({
            type: search.Type.CUSTOMER,
            id: customerId,
            columns: 'overduebalance'
        });

        try{
            if(overdue.overduebalance > 0){
                sendEmail(scriptContext,customerId,overdue);
            }
        }
        catch(e){
            log.error(e);
        }


        }

          /**
         * Sends an email notification regarding the overdue balance of a customer.
         * @param {Object} scriptContext - The context of the script.
         * @param {number} customerId - The ID of the customer with the overdue balance.
         * @param {Object} overdue - The overdue balance information.
         * @param {number} overdue.overduebalance - The overdue balance amount.
         */

        function sendEmail(scriptContext,customerId,overdue){
            try{
            let salesRep = scriptContext.newRecord.getValue('salesrep')
            let senderId=runtime.getCurrentUser().id;
            log.debug("ghgh",senderId);

            let senderEmailId = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: senderId,
                columns: 'email'
            });
            log.debug("jj",senderEmailId.email);

            let recipientId = search.lookupFields({
                type: search.Type.EMPLOYEE,
                id: salesRep,
                columns:['email','internalid'] 
            });
            log.debug("re",recipientId.email);

            email.send({
                author:senderId,
                recipients: recipientId.email,
                subject: 'warning',
                body: 'The customer with id, '+customerId +' for which the sales order has been created, has an overdue balance '+overdue.overduebalance,
            });
            log.debug("email sent");

        }
        catch (error) {
            log.error("Email send error", error);
        }
    }

        return {beforeLoad, beforeSubmit, afterSubmit}

    });
