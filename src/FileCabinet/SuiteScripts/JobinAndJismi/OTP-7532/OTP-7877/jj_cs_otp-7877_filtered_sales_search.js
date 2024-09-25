/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 * @author JobinAndJismi IT Services LLP
 */
define(['N/record', 'N/search', 'N/log'],
    /**
     * @param {record} record
     * @param {search} search
     * @param {log} log
     */
    function (record, search, log) {

        /**
         * Function to be executed after the page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         * @since 2015.2
         */
        function pageInit(scriptContext) {
            // Initialization logic if needed
        }

        /**
         * Function to be executed when a field is changed.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.sublistId - Sublist name
         * @param {string} scriptContext.fieldId - Field name
         * @param {number} scriptContext.lineNum - Line number (undefined if not a sublist)
         * @param {number} scriptContext.columnNum - Column number (undefined if not a matrix field)
         * @since 2015.2
         */
        function fieldChanged(scriptContext) {
            let newRecord = scriptContext.currentRecord;
            let fieldId = scriptContext.fieldId;

            if (['custpage_subsidiary_filter', 'custpage_customer_filter', 'custpage_statusfield', 'custpage_department_filter'].includes(fieldId)) {
                displayOrders(newRecord);
            }
        }

        /**
         * Displays sales orders based on the selected filters.
         *
         * @param {Record} newRecord - Current form record
         */
        function displayOrders(newRecord) {
            // Clear existing sublist entries
            clearSublist(newRecord, 'custpage_sublist');
            // Execute the search and populate the sublist
            resultSearch(newRecord);
        }

        /**
         * Clears all lines from the specified sublist.
         *
         * @param {Record} newRecord - Current form record
         * @param {string} sublistId - Sublist ID to clear
         */
        function clearSublist(newRecord, sublistId) {
            let lineCount = newRecord.getLineCount({ sublistId: sublistId });
            for (let i = lineCount - 1; i >= 0; i--) {
                newRecord.removeLine({ sublistId: sublistId, line: i });
            }
        }

        /**
         * Searches for sales orders based on selected filters and populates the sublist.
         *
         * @param {Record} newRecord - Current form record
         */
        function resultSearch(newRecord) {
            let filters = buildSearchFilters(newRecord);
            log.debug("filters", filters);

            let salesOrderSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: filters,
                columns: [
                    'entity', // Customer Name
                    'subsidiary', // Subsidiary
                    'trandate',
                    'tranid',
                    'status',
                    'department',
                    'class',
                    'taxtotal',
                    'total',
                    'internalid'
                ]
            });

            let resultSet = salesOrderSearch.run().getRange({
                start: 0,
                end: 100
            });

            populateSublist(newRecord, resultSet);
        }

        /**
         * Builds the search filters based on user selections.
         *
         * @param {Record} newRecord - Current form record
         * @returns {Array} An array of search filters
         */
        function buildSearchFilters(newRecord) {
            let filters = [['mainline', 'IS', 'T']];
            let subsidiaryName = newRecord.getValue('custpage_subsidiary_filter');
            let customerName = newRecord.getValue('custpage_customer_filter');
            let deptName = newRecord.getValue('custpage_department_filter');
            let statusFilter = newRecord.getText('custpage_statusfield');

            if (customerName) filters.push('AND', ['customer.internalid', 'anyOf', customerName]);
            if (subsidiaryName) filters.push('AND', ['subsidiary.internalid', 'anyOf', subsidiaryName]);
            if (deptName) filters.push('AND', ['department.internalid', 'anyOf', deptName]);

            if (statusFilter) {
                let statusMap = {
                    'Pending Fulfillment': 'SalesOrd:B',
                    'Partially Fulfilled': 'SalesOrd:D',
                    'Pending Billing': 'SalesOrd:F'
                };
                if (statusMap[statusFilter]) {
                    filters.push('AND', ['status', 'anyof', statusMap[statusFilter]]);
                }
            }

            return filters;
        }

        /**
         * Populates the sublist with search results.
         *
         * @param {Record} newRecord - Current form record
         * @param {Array} resultSet - Array of search results
         */
        function populateSublist(newRecord, resultSet) {
            resultSet.forEach((result, index) => {
                newRecord.selectNewLine({ sublistId: 'custpage_sublist' });
                
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_customer_name', value: result.getText('entity'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_subsidiary', value: result.getText('subsidiary'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_date', value: result.getValue('trandate'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_doc_no', value: result.getValue('tranid'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_status', value: result.getValue('status'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_department', value: result.getText('department'), ignoreFieldChange: true });
                
                let tax = result.getValue('taxtotal');
                let total = result.getValue('total');
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_subtotal', value: total - tax, ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_total', value: total, ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_tax', value: tax, ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_class', value: result.getText('class'), ignoreFieldChange: true });
                newRecord.setCurrentSublistValue({ sublistId: 'custpage_sublist', fieldId: 'custpage_internal_id', value: result.getValue('internalid'), ignoreFieldChange: true });
                
                newRecord.commitLine({ sublistId: 'custpage_sublist' });
            });
        }

        return {
            
            fieldChanged: fieldChanged
        };
    });
