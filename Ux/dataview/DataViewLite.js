Ext.define('Ux.dataview.DataViewLite', {
    extend : 'Ext.Container',
    xtype  : 'dataviewlite',

    config : {
        allowDeselect : true,
        emptyText     : 'No more items',
        emptyTextEl   : true,
        itemSelector  : '',
        loadingText   : 'Loading...',
        mode          : 'MULTI',
        scrollable    : true,
        selectedCls   : 'x-dataviewlite-selected',
        store         : null
    },

    storeEventHooks: {
        refresh    : 'refresh',
        beforeload : 'onBeforeLoad',
        load       : 'onLoad'
    },

    initialize : function() {
        var me = this;

        me.element.on({
            scope    : me,
            delegate : me.getItemSelector(),
            tap      : 'handleTap'
        });

        me.callParent();
    },

    updateEmptyText: function(newEmptyText, oldEmptyText) {
        var me = this,
            store;

        if (oldEmptyText) {

        }

        if (newEmptyText) {
            store = me.getStore();

            if (store && !store.getCount()) {
                this.showEmptyText();
            }
        }
    },

    applyEmptyTextEl : function(newEl, oldEl) {
        if (oldEl) {
            oldEl.destroy && oldEl.destroy();
        }

        var emptyText = this.getEmptyText(),
            store     = this.getStore();

        if (store.isLoading()) {
            return newEl;
        }

        if (newEl && emptyText) {
            var scrollable = this.getScrollable(),
                el;

            if (scrollable) {
                el = scrollable.getScroller().getElement();
            } else {
                el = this.element;
            }

            if (el) {
                if (typeof emptyText === 'string') {
                    emptyText = {
                        html : emptyText
                    };
                }

                newEl = el.createChild(emptyText);
            }
        }

        return newEl;
    },

    applyStore: function(store) {
        var me         = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (store) {
            store = Ext.data.StoreManager.lookup(store);

            if (store && Ext.isObject(store) && store.isStore) {
                store.on(bindEvents);

                proxy = store.getProxy();

                if (proxy) {
                    reader = proxy.getReader();

                    if (reader) {
                        reader.on('exception', 'handleException', this);
                    }
                }
            }
            //<debug warn>
            else {
                Ext.Logger.warn("The specified Store cannot be found", this);
            }
            //</debug>
        }

        return store;
    },

    updateStore: function(newStore, oldStore) {
        var me         = this,
            bindEvents = Ext.apply({}, me.storeEventHooks, { scope: me }),
            proxy, reader;

        if (oldStore && Ext.isObject(oldStore) && oldStore.isStore) {
            if (oldStore.autoDestroy) {
                oldStore.destroy();
            } else {
                oldStore.un(bindEvents);
                proxy = oldStore.getProxy();

                if (proxy) {
                    reader = proxy.getReader();

                    if (reader) {
                        reader.un('exception', 'handleException', this);
                    }
                }
            }
        }

        if (newStore) {
            if (newStore.isLoading()) {
                me.onBeforeLoad();
            } else {
                me.refresh();
            }
        }
    },

    handleException: function() {
        this.setMasked(false);
    },

    handleTap : function(e) {
        var selector = this.getItemSelector(),
            target   = e.getTarget(selector),
            rows     = this.element.query(selector),
            index    = rows.indexOf(target);

        this.toggleSelect(index);
    },

    refresh : function() {
        var me      = this,
            store   = me.getStore(),
            records = store.getRange(),
            r       = 0,
            rLen    = records.length,
            data    = [],
            record;

        for (; r < rLen; r++) {
            record = records[r];

            data.push(me.getRecordData(record));
        }

        data = me.prepareData(data);

        me.setData(data);
    },

    getRecordData : function(record) {
        return record.getData();
    },

    prepareData : function(data) {
        return data;
    },

    onBeforeLoad : function() {
        var scrollable = this.getScrollable();

        if (scrollable) {
            scrollable.getScroller().stopAnimation();
        }

        var loadingText = this.getLoadingText();

        if (loadingText) {
            if (typeof loadingText === 'string') {
                loadingText = {
                    xtype   : 'loadmask',
                    message : 'loadingText'
                };
            }

            this.setMasked(loadingText);

            //disable scorlling while it is masked
            if (scrollable) {
                scrollable.getScroller().setDisabled(true);
            }
        }

        this.hideEmptyText();
    },

    onLoad: function(store) {
        //remove any masks on the store
        this.setMasked(false);

        //enable the scroller again
        var scrollable = this.getScrollable();

        if (scrollable) {
            scrollable.getScroller().setDisabled(false);
        }

        this[store.getCount() > 0 ? 'hideEmptyText' : 'showEmptyText']();
    },

    selectItem : function(index, suppressEvents) {
        this.toggleSelect(index, true, suppressEvents);
    },

    deselectItem : function(index, suppressEvents) {
        this.toggleSelect(index, false, suppressEvents);
    },

    selectAll : function() {
        var me       = this,
            el       = me.element,
            selector = me.getItemSelector(),
            cls      = me.getSelectedCls(),
            items    = el.query(selector),
            i        = 0,
            iLen     = items.length,
            item, itemEl, index;

        // <debug warn>
        var mode = me.getMode();
        if (mode === 'SINGLE') {
            Ext.Logger.warn('You are trying to select all items but you are using SINGLE mode. Only the last item will be selected.');
        }
        // </debug>

        if (i !== iLen) {
            for (; i < iLen; i++) {
                item   = items[i];
                itemEl = Ext.get(item);

                if (!itemEl.hasCls(cls)) {
                    index = items.indexOf(item);

                    me.selectItem(index);
                }
            }
        }
    },

    deselectAll : function() {
        var me       = this,
            selected = me.getSelected('index'),
            s        = 0,
            sLen     = selected.length;

        if (s !== sLen) {
            me.deselectItem(selected[s]);
        }
    },

    toggleSelect : function(index, select, suppressEvents) {
        var me       = this,
            el       = me.element,
            selector = me.getItemSelector(),
            cls      = me.getSelectedCls(),
            event;

        if (Ext.isArray(index)) {
            var i    = 0,
                iLen = index.length;

            for (; i < iLen; i++) {
                me.toggleSelect(index[i]);
            }

            return;
        } else if (!Ext.isNumber(index)) {
            var store = me.getStore();

            index = store.indexOf(index);
        }

        if (index < 0) {
            return;
        }

        var items = el.query(selector),
            item  = items[index];

        if (item) {
            item = Ext.get(item);
        }

        if (!Ext.isDefined(select)) {
            select = !item.hasCls(cls);
        }

        event = select ? 'select' : 'deselect';

        if (!select && !me.getAllowDeselect() || (me.fireEvent('before' + event, me, index, item) === false)) {
            return;
        }

        if (me.getMode() === 'SINGLE' && select) {
            me.deselectAll();
        }

        item[select ? 'addCls' : 'removeCls'](cls);

        me.fireEvent(event, me, index, item);
    },

    isSelected : function(index) {
        var me = this;

        if (Ext.isArray(index)) {
            var i    = 0,
                iLen = index.length,
                arr  = [];

            for (; i < iLen; i++) {
                arr.push(me.isSelected(index[i]));
            }

            return arr;
        } else if (!Ext.isNumber(index)) {
            var store = me.getStore();

            index = store.indexOf(index);
        }

        var selector = me.getItemSelector(),
            cls      = me.getSelectedCls(),
            items    = me.element.query(selector),
            item;

        item = Ext.get(items[index]);

        return item.hasCls(cls);
    },

    getSelected : function(toReturn) {
        var me = this,
            selector = me.getItemSelector(),
            cls      = me.getSelectedCls(),
            items    = me.element.query(selector),
            i        = 0,
            iLen     = items.length,
            selected = [],
            store    = me.getStore(),
            item, itemEl, index;

        if (i !== iLen) {
            for (; i < iLen; i++) {
                item   = items[i];
                itemEl = Ext.get(item);

                if (itemEl.hasCls(cls)) {
                    index = items.indexOf(item);

                    switch(toReturn) {
                        case 'record' :
                            selected.push(store.getAt(index));
                            break;
                        case 'element' :
                            selected.push(itemEl);
                            break;
                        case 'index' :
                            selected.push(index);
                            break;
                        default :
                            selected.push(item);
                            break;
                    }
                }
            }
        }

        return selected;
    },

    showEmptyText : function() {
        var el = this.getEmptyTextEl();

        if (el) {
            if (el.dom) {
                el.show();
            } else {
                this.setEmptyTextEl(true);

                el = this.getEmptyTextEl();
            }
        }
    },

    hideEmptyText : function() {
        var el = this.getEmptyTextEl();

        if (el && el.dom) {
            el.hide();
        }
    }
});