Ext.define('Lite.view.Main', {
    extend : 'Ux.dataview.DataViewLite',

    requires : [
        'Ext.data.Store',
        'Ext.data.proxy.Ajax'
    ],

    config : {
        itemSelector : 'tr.row',
        emptyText    : {
            cls  : 'x-dataviewlite-emptytext',
            html : 'No more items for you!'
        },
        tpl          : '<table><tr><td>**HEADER**</td></tr><tpl for="."><tr class="row"><td>{text}</td></tr></tpl></table>',
        store        : {
            autoLoad  : true,
            fields    : ['text'],
            proxy     : {
                type   : 'ajax',
                url    : 'json.json'
            }
        }
    }
});
