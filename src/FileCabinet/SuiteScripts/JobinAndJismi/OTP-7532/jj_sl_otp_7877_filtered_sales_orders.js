/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @author      JobinAndJismi IT Services LLP
 * @Date        September 12, 2024
 * @Title       Custom page for displaying sales orders based on status
 * @JiraCode    OTP-7877
 */

define(['N/ui/serverWidget', 'N/search', 'N/log', 'N/record'], 
    (serverWidget, search, log, record) => {

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        const onRequest = (scriptContext) => {
            if (scriptContext.request.method === 'GET') {
                const salesOrdersForm = createSalesOrdersForm();
                addFilters(salesOrdersForm);
                addStatusFilter(salesOrdersForm);
                addSublist(salesOrdersForm);
                scriptContext.response.writePage(salesOrdersForm);
            }
        };

        /**
         * Creates the main Sales Order form.
         * @returns {Form} The created form.
         */
        const createSalesOrdersForm = () => {
            const salesOrdersForm = serverWidget.createForm({
                title: "Sales Order Form"
            });
            salesOrdersForm.clientScriptModulePath = 'SuiteScripts/JobinAndJismi/OTP-7532/jj_cs_otp-7877_filtered_sales_search.js';

            // Add Refresh button
            salesOrdersForm.addSubmitButton({
                label: 'Refresh',
                id: 'custpage_refresh_button'
            });

            return salesOrdersForm;
        };

        /**
         * Adds customer and subsidiary filters to the form.
         * @param {Form} form - The form to which filters will be added.
         */
        const addFilters = (form) => {
            form.addField({
                id: 'custpage_customer_filter',
                type: serverWidget.FieldType.SELECT,
                label: 'Customer',
                source: 'customer'
            });

            form.addField({
                id: 'custpage_subsidiary_filter',
                type: serverWidget.FieldType.SELECT,
                label: 'Subsidiary',
                source: 'subsidiary'
            });

            form.addField({
                id: 'custpage_department_filter',
                type: serverWidget.FieldType.SELECT,
                label: 'Departments',
                source: 'department'
            });
        };

        /**
         * Adds the status filter to the form using a saved search.
         * @param {Form} form - The form to which the status filter will be added.
         */
        const addStatusFilter = (form) => {
            const statusField = form.addField({
                id: 'custpage_statusfield',
                type: serverWidget.FieldType.SELECT,
                label: 'Status'
            });

            const statusSearch = search.create({
                type: search.Type.SALES_ORDER,
                filters: [['mainline', 'is', 'T']],
                columns: ['status']
            });

            const addedStatuses = new Set();
            statusField.addSelectOption({
                value: '',
                text: ''
            });

            statusSearch.run().each(result => {
                const statusValue = result.getValue({ name: 'status' });
                const statusText = result.getText({ name: 'status' });

                if (!addedStatuses.has(statusValue)) {
                    statusField.addSelectOption({
                        value: statusValue,
                        text: statusText
                    });
                    addedStatuses.add(statusValue);
                    log.debug("Filters", addedStatuses);
                }
                return true;
            });
        };

        /**
         * Adds the sublist to the form to display sales orders.
         * @param {Form} form - The form to which the sublist will be added.
         */
        const addSublist = (form) => {
            const sublist = form.addSublist({
                id: 'custpage_sublist',
                type: serverWidget.SublistType.INLINEEDITOR,
                label: 'Sales Orders to Fulfill or Bill'
            });

            sublist.addField({
                id: 'custpage_internal_id',
                label: 'Internal Id',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_doc_no',
                label: 'Document Name',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_customer_name',
                label: 'Customer Name',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_date',
                label: 'Date',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_status',
                label: 'Status',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_total',
                label: 'Total',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_subsidiary',
                label: 'Subsidiary',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_department',
                label: 'Department',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_class',
                label: 'Class',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_subtotal',
                label: 'Subtotal',
                type: serverWidget.FieldType.TEXT
            });

            sublist.addField({
                id: 'custpage_tax',
                label: 'Tax',
                type: serverWidget.FieldType.TEXT
            });
        };

        return { onRequest };
    });
