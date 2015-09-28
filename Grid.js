"use strict";

/*
 * This file is part of Steel library.
 *
 * (c) Dmitry Sobchenko <sharpensteelgmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


/**
 * custom rendering of column header; i.e. `<th></th>` tag
 * @callback Steel__GridColumnSettings__customRenderHeaderColumn
 * @param {jQuery} $elem column header, rendered by default
 * @param {Steel__Grid} grid
 * @param {Steel__GridColumn} column
 * @return {jQuery} modified (or not) $elem
 */

/**
* custom rendering of cell in row; i.e. <td> tag
* @callback Steel__GridColumnSettings__customRenderCell
* @param {Steel__GridCell} cell
* @param {string} val cell value
* @param {Steel__Grid} grid
* @param {boolean} isEditing
*/


/**
 * get value from cell's editor;  this callback called when finished editing of row
 * @callback Steel__GridColumnSettings__customGetEditorValue
 * @param {Steel__GridCell} cell
 * @return {*}
 */


window.Steel__ENUM_CELL_EDITOR_TYPE = {
	NOT_EDITABLE: 'NOT_EDITABLE',
	CHECKBOX: 'CHECKBOX',              // default render: <input type='checkbox'>
	COLOR: 'COLOR',                    // default render: <input type='color'>,  (no IE support) result style: "#51d9d9"
	DATE: 'DATE',					   // default render: <input type='date'>  (Chrome only support) result style: 1334429392 (timestamp, conveted from input value like "2015-08-25")
	DATETIME_LOCAL: 'DATETIME_LOCAL',  // default render: <input type='datetime-local'>, (Chrome only support),result style: 1334429392 (timestamp, conveted from input value like "2015-08-25T12:31")
	EMAIL: 'EMAIL',                    // default render: <input type='email'>
	NUMBER_INT: 'NUMBER_INT',              // default render: <input type='number' step='1'>
	NUMBER_DOUBLE: 'NUMBER_DOUBLE',    // default render: <input type='checkbox' step='0.000000000001'>
	LISTBOX: 'LISTBOX',                // default render: <select>...</select>;  items from Steel__GridColumnSettings.listDataProvider
	TEXT: 'TEXT'                       // default render: <input type='checkbox'>

	// example of custom editor:
	//
	// someGridSettings.columnsSettings = [
	//     ...
	//     new Steel__GridColumnSettingsEditorTextarea({name:'answer_options'}),
	//     ...
	// ]
};
Steel.ENUM_CELL_EDITOR_TYPE = Steel__ENUM_CELL_EDITOR_TYPE;


window.Steel__ENUM_FILTER_CONDITION = {
	CONTAINS: "CONTAINS",
	DOES_NOT_CONTAIN: "DOES_NOT_CONTAIN",
	EQUAL: "EQUAL",
	NOT_EQUAL: "NOT_EQUAL",
	LESS_THAN: "LESS_THAN",
	GREATER_THAN: "GREATER_THAN",
	LESS_THAN_OR_EQUAL: "LESS_THAN_OR_EQUAL",
	GREATER_THAN_OR_EQUAL: "GREATER_THAN_OR_EQUAL",
	STARTS_WITH: "STARTS_WITH",
	ENDS_WITH: "ENDS_WITH",
	LIKE: "LIKE",
	IN: "IN"
};
Steel.ENUM_FILTER_CONDITION = window.Steel__ENUM_FILTER_CONDITION;

window.Steel__ENUM_FILTER_PREFIX = {
	OR: "OR",
	AND: "AND"
};
window.Steel.ENUM_FILTER_PREFIX = window.Steel__ENUM_FILTER_PREFIX;



class Steel__GridColumnSettings extends Steel__Component{

	constructor(props){
		super();

		/** @var {string} for timestamp: format the same as in PHP date(); for other types: same as sprintf */
		this.format = null;

		/** @var {string} text in column header */
		 this.title =  null;

		this.name = null;

		/** @var {Steel__DataProvider} for drop-down list at header */
		this.listDataProvider = null;

		/** @var int|null null means auto-size  */
		this.width = null;

		this.isReadOnly = false;

		this.isVisible = true;

		this.isSortable = true;

		/* @var {string} constant from enum Steel__ENUM_CELL_EDITOR_TYPE */
		this.cellEditorType = null;

		/** @var {Steel__GridColumnSettings__customRenderHeaderColumn} */
		this.customRenderHeaderColumn = null;

		/** @var {Steel__GridColumnSettings__customRenderCell} callback for custom render of cell (in `edit` and `not-edit` states) */
		this.customRenderCell = null;

		/** @var {Steel__GridColumnSettings__customGetEditorValue} */
		this.customGetEditorValue = null;

		/** @var {array} additional html attributes that applied to <td> and <th> in default rendering */
		this.attributesAdditional = null;

		if(props) this.applyProperties(props);

	}

}
window.Steel__GridColumnSettings = Steel__GridColumnSettings;




class Steel__GridColumnSettingsEditorListbox extends Steel__GridColumnSettings{

	constructor(props){
		super();

		this.cellEditorType = Steel__ENUM_CELL_EDITOR_TYPE.LISTBOX;

		// REQUIRED SETTINGS

		/** @var {array} properties for creating Steel__ListBox; REQUIRED */
		this.listBoxProperties = null;

		/** @var {string} field from wich will be taken values to display in `not-edit` mode */
		this.displayFieldName = null;



		// OPTIONAL SETTINGS

		/** @var {Steel__GridColumnSettings__customRenderCell} callback for custom render of cell (in `edit` and `not-edit` states) */
		this.customRenderCell = this.customRenderCellImplementation.bind(this);

		this.customGetEditorValue = this.customGetEditorValueImplementation.bind(this);


		if(props) this.applyProperties(props);

	}

	/**
	 * custom rendering of cell in row in , i.e. <td> tag
	 * @param {Steel__GridCell} cell
	 * @param {string} val cell value
	 * @param {Steel__Grid} grid
	 * @param {boolean} isEditing
	 */
	customRenderCellImplementation(cell, val, grid, isEditing) {
		if (!isEditing || cell.column.isReadOnly ) { // don't need to render listbox

			let displayVal = cell.row.rowData[this.displayFieldName];

			if(displayVal == undefined || displayVal == null) displayVal = '';

			// todo: formatting

			cell.$cell.html(displayVal);
			return;
		}

		let props = Steel__getProperties(this.listBoxProperties);
		props.valueSelected = val;

		let listbox = new Steel__ListBox(props);
		let $listbox = listbox.render();


		listbox.registerOnEditorValueChanged(function(event, newValue){
			cell.emmitOnEditorValueChanged(newValue);
		});

		cell.sb_listbox = listbox;
		cell.$cell.empty().append($listbox);
	}

	/**
	 * get value from cell's editor;  this callback called when finished editing of row
	 * @param {Steel__GridCell} cell
	 * @param {Steel__Grid} grid
	 * @return {*}
	 */
	customGetEditorValueImplementation(cell){
		return cell.sb_listbox ? cell.sb_listbox.getSelectedValue() : null;
	}

}
window.Steel__GridColumnSettingsEditorListbox = Steel__GridColumnSettingsEditorListbox;



class Steel__GridColumnSettingsEditorTextarea extends Steel__GridColumnSettings{

	constructor(props){
		super();

		this.cellEditorType = Steel__ENUM_CELL_EDITOR_TYPE.TEXT;

		// OPTIONAL SETTINGS

		/** @var {Steel__GridColumnSettings__customRenderCell} callback for custom render of cell (in `edit` and `not-edit` states) */
		this.customRenderCell = this.customRenderCellImplementation.bind(this);

		if(props) this.applyProperties(props);

	}

	/**
	 * custom rendering of cell in row in , i.e. <td> tag
	 * @param {Steel__GridCell} cell
	 * @param {string} val cell value
	 * @param {Steel__Grid} grid
	 * @param {boolean} isEditing
	 */
	customRenderCellImplementation(cell, val, grid, isEditing)
	{
		if(!isEditing || cell.column.isReadOnly){
			return;
		}
		//<input type="text" class="sg_cellEditor" sg_celleditortype="TEXT">
		var $editor = $('<textarea></textarea>');
		$editor.val(val);
		$editor.attr({
			'class':"sg_cellEditor",
			sg_celleditortype: "TEXT"
		});
		cell.$cell.empty().append($editor);

	}
}
window.Steel__GridColumnSettingsEditorTextarea = Steel__GridColumnSettingsEditorTextarea;



class Steel__GridColumnSettingsActionEdit extends Steel__GridColumnSettings{

	constructor(props){
		super();

		this.cellEditorType = Steel__ENUM_CELL_EDITOR_TYPE.NOT_EDITABLE;

		this.title = 'Редакт.';
		this.name = '-edit';
		this.isSortable = false;
		this.width = 52;

		this.attributesAdditional = {sg_textAlign:"center"};

		/** @var {Steel__GridColumnSettings__customRenderCell} callback for custom render of cell (in `edit` and `not-edit` states) */
		this.customRenderCell = this.customRenderCellImplementation.bind(this);

		if(props) this.applyProperties(props);

	}

	/**
	 * rendering cell with `Edit` or `Apply`/`Cancel` buttons
	 *
	 * @param {Steel__GridCell} cell
	 * @param {string} val cell value
	 * @param {Steel__Grid} grid
	 * @param {boolean} isEditing
	 */
	customRenderCellImplementation(cell, val, grid, isEditing) {
		let $bp = $('<div class="sg_buttonsEditParent"></div>');

		if (!isEditing) {
			let $buttonEditStart = $('<div class="sg_button sg_buttonEditStart" title="Изменить"></div>');
			$buttonEditStart.click(function(){ grid.doEditStart(cell.row); });
			$bp.append($buttonEditStart);
		}
		else{
			let $buttonEditApply = $('<div class="sg_button sg_buttonEditApply" title="Сохранить изменения"></div>');
			$buttonEditApply.click(function(){ grid.doEditStop(1); });

			let $buttonEditCancel = $('<div class="sg_button sg_buttonEditCancel" title="Отменить изменения"></div>');
			$buttonEditCancel.click(function(){ grid.doEditStop(0); });
			$bp.append([$buttonEditApply, $buttonEditCancel]);
		}

		cell.$cell.empty().append($bp);

	}

}
window.Steel__GridColumnSettingsActionEdit = Steel__GridColumnSettingsActionEdit;


class Steel__GridColumnSettingsActionDelete extends Steel__GridColumnSettings{
	constructor(props){
		super();


		this.title = 'Удалить';
		this.name = '-delete';
		this.isSortable = false;
		this.width = 40;

		this.attributesAdditional = {sg_textAlign:"center"};

		/** @var {Steel__GridColumnSettings__customRenderCell} callback for custom render of cell (in `edit` and `not-edit` states) */
		this.customRenderCell = this.customRenderCellImplementation.bind(this);

		if(props) this.applyProperties(props);
	}

	/**
	 * rendering cell with `Edit` or `Appy`/`Cancel` buttons
	 *
	 * @param {Steel__GridCell} cell
	 * @param {string} val cell value
	 * @param {Steel__Grid} grid
	 * @param {boolean} isEditing
	 */
	customRenderCellImplementation(cell, val, grid, isEditing) {
		let $button = $('<div class="sg_button sg_actionDelete" title="Delete"></div>');
		$button.click(function(){ grid.doDelete(cell.row); });
		cell.$cell.empty().append($button);
	}
}
window.Steel__GridColumnSettingsActionDelete = Steel__GridColumnSettingsActionDelete;



/**
 * visible column of Grid
 */
class Steel__GridColumn extends Steel__Component {

	constructor() {
		super();

		/** @var Steel__GridColumnSettings */
		this.settings = null;

		this.name = null;

		/** @var Steel__DataProviderField */
		this.field = null;


		/** @var int */
		this.widthAuto = null;

	}


	/** @returns string */
	get title() {
		if (this.settings && this.settings.title) return this.settings.title;
		if (this.field && this.field.title) {
			return this.field.title;
		}
		return this.name;
	}

	/** @returns bool */
	get isReadOnly() {
		if (this.settings && this.settings.isReadOnly) return true;
		if(!this.field) return true;
		return !!this.field.isReadOnly;
	}

	/** @returns {string} constant from Steel__ENUM_CELL_EDITOR_TYPE */
	get cellEditorType(){
		let res = null;
		if (this.settings && this.settings.cellEditorType) {
			res = this.settings.cellEditorType;
		}
		else{
			switch(this.fieldDataType){
			case Steel__ENUM_PROVIDER_DATA_TYPE.STRING:
				res =  Steel__ENUM_CELL_EDITOR_TYPE.TEXT;
				break;
			case Steel__ENUM_PROVIDER_DATA_TYPE.INT:
				res =  Steel__ENUM_CELL_EDITOR_TYPE.NUMBER_INT;
				break;
			case Steel__ENUM_PROVIDER_DATA_TYPE.DOUBLE:
				res =  Steel__ENUM_CELL_EDITOR_TYPE.NUMBER_DOUBLE;
				break;
			case Steel__ENUM_PROVIDER_DATA_TYPE.BOOL:
				res =  Steel__ENUM_CELL_EDITOR_TYPE.CHECKBOX;
				break;
			case Steel__ENUM_PROVIDER_DATA_TYPE.TIMESTAMP:
				res =  Steel__ENUM_CELL_EDITOR_TYPE.DATE;
				break;
			}
		}
		if(!res) res = Steel__ENUM_CELL_EDITOR_TYPE.TEXT;
		return res;
	}

	get fieldDataType(){
		let t = this.field ? this.field.dataType : null;
		if(!t) t = Steel__ENUM_PROVIDER_DATA_TYPE.STRING;
		return t;
	}
}
window.Steel__GridColumn = Steel__GridColumn;



class Steel__PacketServerGridAfterFetch  extends Steel__PacketServerDataProviderFetch{

	constructor(props){
		super();

		this.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_FETCH;

		this.totalRows = 0;
		this.offset = 0;

		/** @var string[] column names on wich was sorting */
		this.sorting = [];

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketServerGridAfterFetch = Steel__PacketServerGridAfterFetch;



class Steel__PacketServerGridAfterInsertId extends Steel__PacketServerDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_INSERT_ID;

		/** @var mixed example: 5492 */
		this.keyValue = null;

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketServerGridAfterInsertId = Steel__PacketServerGridAfterInsertId;


class Steel__PacketServerGridAfterUpdate extends Steel__PacketServerDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_UPDATE;

		this.keyValue = null;

		/** @var mixed[] example: {id:5492, cost:32.32} */
		this.columnValues = null;

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketServerGridAfterUpdate = Steel__PacketServerGridAfterUpdate;


class Steel__PacketServerGridAfterDelete extends Steel__PacketServerDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_DELETE;

		this.keyValue = null;

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketServerGridAfterDelete = Steel__PacketServerGridAfterDelete;


class Steel__PacketClientGridFetch extends Steel__PacketClientDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_CLIENT_OPERATION.FETCH;

		/** @var string[]|null */
		this.fieldsNeed = null;

		this.offset = 0;
		this.limit = 0;

		/** @var string[] example: [ ['dt',1], ['cost',-1] ] */
		this.sorting = [];


		/** @var mixed[] example: [ 'or', ['contains','name','Pooh'], ['>=','cost', 32213.3], ['in', [1,3,55] ] ] */
		this.filters = [];

		if(props) this.applyProperties(props);
	}

	/**
	 * @param {Steel__PacketClientGridFetch} packet
	 * @return Steel__DataProviderField[]
	 */
	generateDataProviderFieldsBy(packet){
		throw Steel__EXCEPTION__NOT_IMPLEMENTED;

	}
}
window.Steel__PacketClientGridFetch = Steel__PacketClientGridFetch;


class Steel__PacketClientGridInsertId extends Steel__PacketClientDataProvider{

	constructor(){
		super();
		this.operation = Steel.ENUM_PACKET_CLIENT_OPERATION.INSERT_ID;

		// no params
	}
}
window.Steel__PacketClientGridInsertId = Steel__PacketClientGridInsertId;


class Steel__PacketClientGridUpdate extends Steel__PacketClientDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_CLIENT_OPERATION.UPDATE;

		this.keyValue = null;

		/** @var *[]|null example: {'cost':32.32} */
		this.columnValues = null;

		if(props) this.applyProperties(props);
	}
}
window.Steel__PacketClientGridUpdate = Steel__PacketClientGridUpdate;


class Steel__PacketClientGridDelete extends Steel__PacketClientDataProvider{

	constructor(props){
		super();
		this.operation = Steel.ENUM_PACKET_CLIENT_OPERATION.DELETE;

		this.keyValue = null;

		if(props) this.applyProperties(props);
	}
}
window.Steel__PacketClientGridDelete = Steel__PacketClientGridDelete;


class Steel__GridCell extends Steel__Component
{
	constructor(props)
	{
		super();

		/** @var {Steel__GridRow} */
		this.row = null;

		/** @var {jQuery} */
		this.$cell = null;

		/** @var {Steel__GridColumn} */
		this.column = null;

		this.applyProperties(props);


		if(props) this.applyProperties(props);
	}

	/** default implementation */
	getEditorValue(cell){
		let $editor = cell.$cell.find('.sg_cellEditor');

		let valMixed = $editor.length ? $editor.val() : '';


		//return Steel__Grid.convertValueToFieldDataType(valMixed, this.column.field);
		return valMixed;
	}

	/**
	 * @param {function(*, *)} handler when editor value changes, handler(event, newValue) called
	 * @returns {string} eventUid for unregister
	 */
	registerOnEditorValueChanged(handler){
		var eventUid = 'Steel__GridCell:EditorValueChanged.UID'+Math.floor(Math.random()*100000000000);
		this.$cell.on(eventUid,handler);
		return eventUid;
	}

	unregisterOnEditorValueChanged(eventUid){
		return this.$cell.off(eventUid);
	}

	emmitOnEditorValueChanged(newValue){
		this.$cell.trigger('Steel__GridCell:EditorValueChanged',newValue);
	}

	setupEvents(){
		let prevValue = this.getEditorValue(this);
		let _ = this;
		this.$cell.find('.sg_cellEditor').on('keypress',//'change paste keyup input propertychange',
			function(e){
				if(e.which != 13) return;
				let newValue = _.getEditorValue(_);
				if(newValue == prevValue) return;
				prevValue = newValue;
				_.emmitOnEditorValueChanged(newValue);
			}
		);
	}

}


class Steel__GridRow extends Steel__Component {
	constructor(props) {
		super();

		/** @var {jQuery} */
		this.$row = null;

		/** @var {array} */
		this.rowData = [];

		/** @var {bool} */
		this.isEditing = false;

		/** @var {Steel__GridCell[]} */
		this.cells = [];

		this.applyProperties(props);
	}
}





class Steel__GridSettings extends Steel__Component{
	constructor(props){
		super();

		/** @var {Steel__DataProvider} */
		this.dataProvider = null;

		/** @var {mixed[]} example: [ ['dt',1], ['cost',-1] ] */
		this.sorting = null;

		this.limit = 30;


		/** @var {int} size in pixels only supported */
		this.fixedWidth = null;
		/** @var {int} not working yet!!!*/
		this.fixedHeight = null;

		this.enabledEdit = true;
		this.enabledInsert = true;
		this.enabledDelete = true;
		this.enableFilter = true;

		this.isColumnsAutogenerated = true;

		/** @var bool implemented!!!*/
		this.isEditMode = false; // not implemented

		/** @var {Steel__GridColumnSettings[]} */
		this.columnsSettings = [];
		/** @var {Steel__GridColumnSettings[string]} */
		this.columnsSettingsByName = {};

		/** @var {*[][]} compatible with Qb_filter format; example: [ ['name','CONTAINS','Pooh','AND'], ['cost','GREATER_THAN_OR_EQUAL',32213.3,'AND'], ['id','IN', [1,3,55], 'AND' ] ]  */
		this.filters = [];



		if(props) this.applyProperties(props);
	}


	applyProperties(props){

		super.applyProperties(props);

		if(props && props.columnsSettings)
		{
			this.columnsSettings = [];

			for(let i=0; i<props.columnsSettings.length; i++){
				let pcs = props.columnsSettings[i];
				let cs = pcs;
				if(!(cs instanceof Steel__GridColumnSettings)){
					cs = new Steel__GridColumnSettings(pcs);
				}
				this.columnsSettings.push(cs);
			}
			this.columnsSettingsByNameReindex();
		}
	}

	/**
	 *
	 * @param {array|Steel__GridColumnSettings} propsOrInstance
	 */
	columnSettingsAdd(propsOrInstance){
		let cs = null;

		if(propsOrInstance instanceof Steel__GridColumnSettings){
			cs = propsOrInstance;
		}
		else {
			let name = props['name'];
			if (!Steel.isSet(name)) throw "`name` not set!";
			if (this.columnsSettingsByName[name]) throw "already exists columnsSettings with name `" + name + "`";

			let cs = new Steel__GridColumnSettings(props);
		}
		this.columnsSettings.push(cs);
		this.columnsSettingsByName[cs.name] = cs;
		return cs;
	}

	columnSettingsRemove(name){
		for(let i=this.columnsSettings.length-1; i>=0; i--){
			let cs = this.columnsSettings[i];
			if(cs.name == name)
				this.columnsSettings.splice(i,1);
		}
		delete this.columnsSettingsByName[name];
	}


	columnsSettingsByNameReindex(){
		/** @var Steel__GridColumnSettings[string] */
		this.columnsSettingsByName = {};
		for(let i=0; i<this.columnsSettings.length; i++){
			let cs = this.columnsSettings[i];
			this.columnsSettingsByName[cs.name] = cs;
		}
	}


}
window.Steel__GridSettings = Steel__GridSettings;



class Steel__Grid extends Steel__IDataReceiver{

	/**
	 *  @param mixed[] paramsSettings parameters for initilialize Steel__GridSettings structure
	 */
	constructor(paramsSettings){
		super();

		/** @var {Steel__GridSettings} */
		this.settings = new Steel__GridSettings();

		if(paramsSettings) this.settings.applyProperties(paramsSettings);

		/** @var Steel__GridColumn[] */
		this.columns = [];

		/** @var Steel__GridColumn[string] */
		this.columnsByName = {};


		/** @var string automaticly filled after fetching columns info from provider */
		this.keyFieldName = null;

		/** @var Steel__DataProviderField[] */
		this.fieldsAvailable = [];
		/** @var Steel__DataProviderField[string] */
		this.fieldsAvailableByName = {};

		this.offset = 0;


		this.$elemContainer = null;
		this.$root = null;

		/** @var mixed[] */
		this.rowsData = [];
		this.totalRows = 0;

		this.needRender = { header: true, pageNavigation: true, body: true};

		/** @var is init() already called or not */
		this.isInited = false;

		this.isRenderedInitial = false;


		/** @var boolean */
		this.isInsertIdMode = false;
		/** @var mixed after fetching data, automatically start editing of record with this key */
		this.insertIdModeKeyValue = null;

		this.isEditing = false;

		/** @var {Steel__GridRow} */
		this.currentRow = null;

		/** @var {Steel__GridRow[]} */
		this.rows = null;

		/** @var {Steel__GridRow[]} poor-man's filter... like ordinary row in edit mode */
		this.filterRow = null;



	}


	/**
	 * need to call after properties setup and before any action
	 * purposed to analyze initial settings and prepare to work
	 */
	init(){
		this.initIfNeed();
	}

	/**
	 * need to call after properties setup and before any action
	 * purposed to analyze initial settings and prepare to work
	 */
	initIfNeed(){
		if(this.isInited) return;
		this.isInited = true;
		this.settings.columnsSettingsByNameReindex();
		this.columnsRecreate();
	}

	get dataProvider(){
		return this.settings.dataProvider;
	}

	set dataProvider(dataProvider){
		if(this.settings.dataProvider == dataProvider) return;
		this.settings.dataProvider = dataProvider;

		this.initIfNeed();

		this.checkColumnsAvailableChanges(null);

		//this.renderWhatNeed();
	}


	packetFetchMake(){
		let packet = new Steel__PacketClientGridFetch();

		/** @var string[]|null */
		packet.columnsNeed = this.columnsByName ? Object.keys(this.columnsByName) : [];
		packet.offset = this.offset;
		packet.limit = this.settings.limit;

		/** @var string[] example: [ ['dt',1], ['cost',-1] ] */
		packet.sorting = this.settings.sorting;

		/** @var mixed[] example: [ 'or', ['like','name','Pooh'], ['>=','cost', 32213.3], ['in', [1,3,55] ] ] */
		packet.filters = this.settings.filters;
		return packet;
	}

	fetchData(){
		this.initIfNeed();
		let packet = this.packetFetchMake();
		this.settings.dataProvider.request(this, [packet]);
	}

	columnsRecreate(){
		this.columns = [];

		if(this.settings.isColumnsAutogenerated){
			if(this.fieldsAvailable){
				for(let i=0; i<this.fieldsAvailable.length; i++){
					let f = this.fieldsAvailable[i];
					let col = new Steel__GridColumn();
					col.name = f.name;
					col.field = f;
					let cs = this.settings.columnsSettingsByName[col.name];
					if(cs) col.settings = cs;
					this.columns.push(col);
				}
			}
		}
		else {
			for (let i = 0; i < this.settings.columnsSettings.length; i++){
				let cs = this.settings.columnsSettings[i];
				if(!cs.isVisible) continue;
				let col = new Steel__GridColumn();
				col.name = cs.name;
				col.settings = cs;
				this.columns.push(col);
			}
		}

		this.columnsByNameReindex();


		if(this.settings.enabledEdit) {
			let cs = this.settings.columnsSettingsByName['-edit'];
			if(!cs){
				cs = new Steel__GridColumnSettingsActionEdit();
				this.settings.columnSettingsAdd(cs);
			}
			if(!this.columnsByName[cs.name]){
				this.columnAdd(cs.name);
			}
		}


		if(this.settings.enabledDelete) {
			let cs = this.settings.columnsSettingsByName['-delete'];
			if(!cs){
				cs = new Steel__GridColumnSettingsActionDelete();
				this.settings.columnSettingsAdd(cs);
			}
			if(!this.columnsByName[cs.name]){
				this.columnAdd(cs.name);
			}
		}



		this.needRender.header = this.needRender.body = this.needRender.pageNavigation = true;
	}


	renderInitial(elemContainer){
		this.initIfNeed();
		let $ = jQuery;
		let _ = this; // for nested functions

		this.$elemContainer = $(elemContainer);
		this.$root = $('<table class="Steel__Grid"></table>');
		this.$header = $('<thead class="sg_header"></thead>');
		this.$body = $('<tbody></tbody>');
		this.$footer = $('<tfoot class="sg_footer"><tr><td class="sg_pageNavigation" colspan="999">'+
			(this.settings.enabledInsert ? '<div class="sg_button sg_buttonInsert">Добавить</div>' : '')+
			'<div class="sg_button sg_buttonPageFirst"></div>  <div class="sg_button sg_buttonPageLeft"></div> <div class="sg_buttonsPages"></div> <div class="sg_button sg_buttonPageRight"></div>  <div class="sg_button sg_buttonPageLast"></div>'+
			'<div class="sg_totalsInfo">+</div></td></tr></tfoot>');
		this.$pageNavigation = this.$footer.find('.sg_pageNavigation');


		if(this.settings.fixedWidth != null){
			this.$root.css('width',this.settings.fixedWidth+'px');
		}
		if(this.settings.fixedHeight != null)
			this.$root.css('height',this.settings.fixedHeight+'px');



		this.$root.append(this.$header).append(this.$body).append(this.$footer);


		$(this.$elemContainer).append(this.$root);
		this.$root.data('Steel__Grid',this);


		this.$pageNavigation.find('.sg_buttonPageFirst,.sg_buttonPageLast,.sg_buttonPageLeft,.sg_buttonPageRight,.sg_buttonsPages').click(function(e){
			let $target = $(e.target);
			let offset = _.offset;
			let limit = _.settings.limit ? _.settings.limit : _.totalRows;
			if($target.closest('.sg_buttonPageFirst').length) offset = 0;
			else if($target.closest('.sg_buttonPageLast').length) offset = _.totalRows - limit;
			else if($target.closest('.sg_buttonPageLeft').length) offset -= limit;
			else if($target.closest('.sg_buttonPageRight').length) offset += limit;
			else if($target.closest('.sg_buttonPage').length){
				let pageNum = parseInt($target.closest('.sg_buttonPage').attr('sg_pageNum'));
				offset = limit * (pageNum - 1);
			}
			else return;
			offset = Math.max(0, Math.min(offset, _.totalRows - limit));
			_.offset = offset;
			_.fetchData();
		});

		this.$pageNavigation.find('.sg_buttonInsert').click(function(e){
			_.doInsert();
		});

		this.$header.click(function(e){
			let $th = $(e.target).closest('.sg_th');
			if(!$th.length) return;

			let isAsc = $th.attr('sg_sort')=="asc";
			let isDesc = $th.attr('sg_sort')=="desc";
			let columnName = $th.attr('sg_columnName');

			if(isAsc){
				//$th.removeClass('sg_sortAsc').addClass('sg_sortDesc');
				_.settings.sorting = [ [columnName, -1] ];
			}
			else if(isDesc){
				//$th.removeClass('sg_sortDesc');
				_.settings.sorting = [];
			}
			else{
				//$th.addClass('sg_sortAsc');
				_.settings.sorting = [ [columnName, 1] ];
			}
			_.fetchData();
		});



		this.needRender.header = this.needRender.pageNavigation = this.needRender.body = true;

		this.isRenderedInitial = true;
		this.renderWhatNeed();

		return this.$root;
	}

	renderWhatNeed(){
		if(!this.isRenderedInitial) return;

		if(this.needRender.header){
			this.renderHeader();
			this.needRender.header = false;
		}

		if(this.needRender.pageNavigation){
			this.refreshPageNavigation();
			this.needRender.pageNavigation = false;
		}

		if(this.needRender.body){
			this.renderBody();
			this.needRender.body = false;
		}

	}

	renderBody(){

		this.isEditing = false;
		this.currentRow = null;

		this.rows = [];
		this.$body.empty();
		let $rows = [];
		for(let i=0; i<this.rowsData.length; i++){
			let rowData = this.rowsData[i];
			let row = new Steel__GridRow({rowData:rowData});
			let isEditing = this.isInsertIdMode && (rowData[this.keyFieldName] == this.insertIdModeKeyValue);
			if(isEditing){
				this.isEditing = true;
				this.currentRow = row;
			}
			row.$row = $('<tr class="sg_tr"></tr>');
			this.renderRowContent(row, isEditing);

			$rows.push(row.$row);
			this.rows.push(row);
		}

		this.$body.append($rows);
	}


	/**
	 *
	 * @param {Steel__GridCell} cell
	 * @param {string} cellValue
	 * @param {bool} isEditing
	 * @param {bool} isFilterRow  do we rendering poor-man's filter?
	 */
	static renderCellDefault(cell, cellValue, isEditing, isFilterRow)
	{
		let col = cell.column;

		let dataType = col.field ? col.field.dataType : null;
		if(!dataType) dataType = Steel.ENUM_PROVIDER_DATA_TYPE.STRING

		let format = col.settings ? col.settings.format : '';

		let $cell = $('<td class="sg_cell"></td>');
		$cell.attr('sg_columnName', col.name);
		cell.$cell = $cell;

		if(col.settings && col.settings.attributesAdditional){
			$cell.attr(col.settings.attributesAdditional);
		}

		let isFieldReadOnly = col.field ? (col.field.isReadOnly && !isFilterRow) : 0;

		if(isFilterRow && dataType == Steel.ENUM_PROVIDER_DATA_TYPE.TIMESTAMP){
			//isFieldReadOnly = true; // editing it with filterRow not makes sense anyway
		}


		if(isEditing && !isFieldReadOnly){

			$cell.addClass('sg_hasEditor');

			let cellEditorType = col.cellEditorType;

			let $editor = $('<input>');



			let attributes = {
				"class": 'sg_cellEditor',
				value: cellValue,
				sg_cellEditorType: cellEditorType
			};


			switch(cellEditorType){
				case Steel__ENUM_CELL_EDITOR_TYPE.CHECKBOX:
					$editor.attr({type: 'checkbox'});
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.COLOR:
					$editor.attr({type: 'color'});
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.DATE:
					$editor.attr({type: 'date'});
					{
						let prevValue = cellValue;
						$editor.on('change',
							function(e){
								let newValue = cell.getEditorValue(cell);
								if(newValue == prevValue) return;
								prevValue = newValue;
								cell.emmitOnEditorValueChanged(newValue);
							}
						);
					}
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.DATETIME_LOCAL:
					$editor.attr({type: 'datetime-local'});
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.EMAIL:
					$editor.attr({type: 'email'});
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.NUMBER_INT:
					$editor.attr({type: 'number'});
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.NUMBER_DOUBLE:
					$editor.attr({type: 'number', step:'0.000000000001'});
					break;
				/*case Steel__ENUM_CELL_EDITOR_TYPE.LISTBOX:
					$editor = $('<select>').attr(attributes);
					if(col.settings && col.settings.listDataProvider){

						let receiver = new Steel__IDataReceiver();
						receiver.onDataReceived = function() {

						};
						col.settings.listDataProvider.request([])
					}

					break;*/
				case Steel__ENUM_CELL_EDITOR_TYPE.TEXT:
				default:
					$editor.attr({type: 'text'});
					break;
			}

			$editor.attr(attributes);

			$cell.append($editor);
		}

		else{  // not editing

			let cellValueFormatted = cellValue; // TODO: do actual formatting


			let $val = cellValueFormatted;

			$val = (""+($val!=null?$val:"")).replace(new RegExp('\\n', 'g'),'<br>\n');




			switch(dataType){
				case Steel__ENUM_PROVIDER_DATA_TYPE.BOOL:
					$val = $('<input type="checkbox" disabled>');
					if(cellValue)
						$val.attr('checked','checked');
					break;
				//case Steel__ENUM_CELL_EDITOR_TYPE.COLOR:
				//	$val = $('<div></div>');
				//	$val.css({display:'inline-block', width:"40px",height:"16px","backround-color":cellValue});
				//	break;
				case Steel__ENUM_PROVIDER_DATA_TYPE.TIMESTAMP:
					if(!cellValue) {
						$val = '';
					}
					else{
						let d = new Date(cellValue*1000);
						$val = d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
					}
					break;
				case Steel__ENUM_CELL_EDITOR_TYPE.LISTBOX:
					//  <--- this will be done at:  Steel__GridColumnSettingsEditorListbox.customRenderCellImplementation()
					break;
				case Steel__ENUM_PROVIDER_DATA_TYPE.DOUBLE:
				case Steel__ENUM_PROVIDER_DATA_TYPE.INT:
				case Steel__ENUM_PROVIDER_DATA_TYPE.STRING:
					// as-is
					break;
			}


			$cell.append($val);
		}

	}

	/**
	 * @param {Steel__GridRow} row
	 * @param {boolean} isEditing
	 */
	renderRowContent(row, isEditing)
	{
		row.$row.data('Steel__GridRow', row);
		row.cells.length = 0;
		row.$row.empty();
		row.$row.toggleClass('sg_rowEditing', isEditing);

		for(let i=0; i<this.columns.length; i++) {
			let col = this.columns[i];
			let val = '';
			if (col.name in row.rowData) {
				val = row.rowData[col.name];
			}

			let cell = new Steel__GridCell({row: row, column: col});
			row.cells.push(cell);

			if (col.settings && col.settings.customGetEditorValue) {
				cell.getEditorValue = col.settings.customGetEditorValue;
			}

			Steel__Grid.renderCellDefault(cell, val, isEditing);


			if (col.settings && col.settings.customRenderCell) {
				col.settings.customRenderCell(cell, val, this, isEditing);
			}
			cell.setupEvents();

			row.$row.append(cell.$cell);
		}
	}

	renderHeader(){


		let $tr = $("<tr></tr>");
		this.$header.empty();


		let colSortedByName = {};
		if(this.settings.sorting){
			for(let i=0; i<this.settings.sorting.length; i++){
				let dir = this.settings.sorting[i][1];
				let colName = this.settings.sorting[i][0];
				colSortedByName[colName] = dir;
			}
		}


		for(let i=0; i<this.columns.length; i++){
			let col = this.columns[i];
			let width_str = (col.settings && col.settings.width != null) ? "width:"+col.settings.width+"px;" : "";

			let sortStr = "";
			if( col.name in colSortedByName){
				sortStr = colSortedByName[col.name] > 0 ? "asc" : "desc";
			}

			let isSortable = (!col.settings || col.settings.isSortable) ? 1 : 0;

			let $col = $('<th></th>');
			$col.html(col.title);

			$col.attr({
				'class': 'sg_th',
				sg_sort: sortStr,
				sg_isSortable: isSortable,
				sg_columnName: col.name,
				style: width_str
			});

			if(col.settings && col.settings.attributesAdditional){
				$col.attr(col.settings.attributesAdditional);
			}

			if(col.settings && col.settings.customRenderHeaderColumn) {
				$col = col.settings.customRenderHeaderColumn($col, this, col);
			}
			$tr.append($col);

		}

		this.$header.append($tr);

		if(this.settings.enableFilter){
			this.renderHeaderFilter();
		}
	}

	/**
	 *
	 * @param {Steel__GridRow} filterRow
	 * @returns {*}
	 */
	generateFiltersByFilterRow(filterRow){

		/** @var mixed[][] compatible with Qb_filter format; example: [ ['name','CONTAINS','Pooh','AND'], ['cost','GREATER_THAN_OR_EQUAL',32213.3,'AND'], ['id','IN', [1,3,55], 'AND' ] ]  */
		let filters = [];

		let colNames = Object.getOwnPropertyNames(filterRow.rowData);
		for(let i=0; i<colNames.length; i++){
			let colName = colNames[i];
			let col = this.columnsByName[colName];
			if(!col) continue;
			let val = filterRow.rowData[colName];

			let dataType = col.field ? col.field.dataType : null;
			if(dataType==null) dataType = Steel__ENUM_PROVIDER_DATA_TYPE.STRING;

			let filter =[
				colName,
				Steel__ENUM_FILTER_CONDITION.CONTAINS,
				val,
				Steel__ENUM_FILTER_PREFIX.AND
			];

			console.log(val);

			if(col.settings && col.cellEditorType ==  Steel__ENUM_CELL_EDITOR_TYPE.DATE){
				if(val=='')continue;
				var dtFrom = (new Date(val))/1000 + new Date().getTimezoneOffset()*60;
				var dtTo = dtFrom + 24*60*60;
				filters.push([colName, Steel__ENUM_FILTER_CONDITION.GREATER_THAN_OR_EQUAL, dtFrom, Steel__ENUM_FILTER_PREFIX.AND]);
				filters.push([colName, Steel__ENUM_FILTER_CONDITION.LESS_THAN, dtTo, Steel__ENUM_FILTER_PREFIX.AND]);
				continue;
			}

			switch(dataType){
				case Steel__ENUM_PROVIDER_DATA_TYPE.INT:
				case Steel__ENUM_PROVIDER_DATA_TYPE.DOUBLE:
				case Steel__ENUM_PROVIDER_DATA_TYPE.TIMESTAMP:
					filter[1] = Steel__ENUM_FILTER_CONDITION.EQUAL;
					if(val == '') {
						filter = null;
						break;
					}
					if((''+val).toLowerCase() == 'null'){
						filter[2] = null;
						break;
					}
					val = parseFloat(val);
					if(isNaN(val) ){
						filter = null;
						break;
					}
					filter[2] = val;
					break;
				case Steel__ENUM_PROVIDER_DATA_TYPE.STRING:
				default:
					// already done
			}
			if(filter)
				filters.push(filter);


		}
		return filters;
	}

	/**
	 *
	 * @param {Steel__GridCell} cell
	 * @param {*} newValue - not necessary in correct field type!
	 */
	onFilterValueChanged(cell, newValue){

		// value not necessary in correct field type!
		this.filterRow.rowData[cell.column.name] = newValue;
		this.settings.filters = this.generateFiltersByFilterRow(this.filterRow);

		/** @var mixed[][] compatible with Qb_filter format; example: [ ['name','CONTAINS','Pooh','AND'], ['cost','GREATER_THAN_OR_EQUAL',32213.3,'AND'], ['id','IN', [1,3,55], 'AND' ] ]  */
		this.fetchData();
	}

	renderHeaderFilter(){


		let row = new Steel__GridRow();
		this.filterRow = row;
		row.$row = $("<tr></tr>").addClass('sg_rowEditing');
		row.$row.data('Steel__GridRow', row);


		for(let i=0; i<this.columns.length; i++) {
			let col = this.columns[i];

			let cell = new Steel__GridCell({row: row, column: col});
			row.cells.push(cell);

			let isEditor = !!col.field;

			if(!isEditor){
				cell.$cell = $('<td></td>');
			}
			else {
				if (col.settings && col.settings.customGetEditorValue) {
					cell.getEditorValue = col.settings.customGetEditorValue;
				}

				let val = '';
				if (col.name in row.rowData) {
					val = row.rowData[col.name];
				}
				Steel__Grid.renderCellDefault(cell, val, true, true);

				if (col.settings && col.settings.customRenderCell) {
					col.settings.customRenderCell(cell, '', this, true);
				}

				cell.setupEvents();

				let _ = this;
				let func = (function (cell_) {
					return function (e, newValue) {
						_.onFilterValueChanged(cell_, newValue);
					}
				})(cell);
				cell.registerOnEditorValueChanged(func);


			}

			cell.$cell.addClass('sg_filter');
			cell.$cell.attr({sg_columnName: col.name});
			row.$row.append(cell.$cell);
		}

		this.$header.append(row.$row);
	}

	refreshPageNavigation(){

		let rowFrom = this.offset+1;
		let rowTo = rowFrom + (this.settings.limit ? this.settings.limit : this.totalRows);
		rowTo = Math.min(rowTo, this.totalRows);

		let totalsInfo = this.totalRows ? (rowFrom + "-" + rowTo + " из " + this.totalRows) : "";

		this.$pageNavigation.find(".sg_totalsInfo").html(totalsInfo);

		let htmlPages = '';
		let limit = this.settings.limit ? this.settings.limit : this.totalRows;
		let pageCount = Math.max(Math.ceil(this.totalRows/limit), 1);
		for(let i=0; i<pageCount; i++){

			let isActive = (this.offset >= i * limit)&&( this.offset < (i+1) * limit );
			htmlPages += '<div class="sg_button sg_buttonPage '+( isActive ? "sg_active" : "")+'" sg_pageNum="'+(i+1)+'">'+(i+1)+'</div>';
		}
		this.$pageNavigation.find(".sg_buttonsPages").html(htmlPages);
	}


	/**
	 * @param {Steel__PacketServerDataProvider[]} packets
	 */
	onDataReceived(packets){
		this.initIfNeed();

		if(typeof(packets.length) != "number"){ throw "packets parameter must be an array"; }

		for(let i=0; i<packets.length; i++){
			let packet = packets[i];

			switch(packet.operation){
				case Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_FETCH:
					this.onPacketReceivedAfterFetch(packet);
					break;
				case Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_INSERT_ID:
					this.onPacketReceivedAfterInsertId(packet);
					break;
				case Steel.ENUM_PACKET_SERVER_OPERATION.ERROR:
					throw packet;
					break;
				case Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_DELETE:
					this.onPacketReceivedAfterDelete(packet);
					break;
				case Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_UPDATE:
					this.onPacketReceivedAfterUpdate(packet);
					break;

				default:
					throw Steel.EXCEPTION__NOT_IMPLEMENTED;
			}


		}
	}



	/**
	 * @param {Steel__PacketServerGridAfterFetch} packet
	 */
	onPacketReceivedAfterFetch(packet){
		this.initIfNeed();

		this.columnsByNameReindex();

		if(!packet.fieldsAvailable){
			Steel__PacketServerDataProviderFetch.generateFieldsAvailableByRows(packet);
		}

		this.fieldsAvailableUpdate(packet.fieldsAvailable);

		this.rowsData = packet.rows;
		this.totalRows = packet.totalRows;
		this.keyFieldName = packet.keyFieldName;

		let newSorting = packet.sorting || [];
		if(JSON.stringify(this.settings.sorting) != JSON.stringify(newSorting) ){
			this.settings.sorting = newSorting;
			this.needRender.header = true;
		}

		this.needRender.body = true;
		this.needRender.pageNavigation = true;

		this.columnsCalculateWidthAuto();

		this.renderWhatNeed();
	}

	/**
	 * @param {Steel__PacketServerGridAfterInsertId} packet
	 */
	onPacketReceivedAfterInsertId(packet){
		this.isInsertIdMode = true;
		this.insertIdModeKeyValue = packet.keyValue;
		// we just getting key with this packed and waiting fetching packet. then automaticly start editing record with this key
	}

	/**
	 * @param {Steel__PacketServerGridAfterDelete} packet
	 */
	onPacketReceivedAfterDelete(){
		// nothing to do here
	}

	/**
	 * @param {Steel__PacketServerGridAfterUpdate} packet
	 */
	onPacketReceivedAfterUpdate(packet){
		// refresh row

		let keyValue = packet.keyValue;
		let columnValues = packet.columnValues;

		for(let i=0; i<this.rows.length; i++){
			let row = this.rows[i];
			if(row.rowData[this.keyFieldName] != keyValue) continue;

			row.rowData = columnValues;

			let isEditings = this.isEditing && this.currentRow == row;

			this.renderRowContent(row, isEditings);
		}

	}




	columnAdd(name){
		if(this.columnsByName[name]) throw "already exists columns with name `"+name+"`";

		let col = new Steel__GridColumn();
		col.name = name;
		col.settings = this.settings.columnsSettingsByName[name];
		col.field = this.fieldsAvailableByName[name];
		this.columns.push(col);
		this.columnsByName[name] = col;

		return col;
	}

	columnRemove(name){
		for(let i=this.columns.length-1; i>=0; i--){
			let cs = this.columns[i];
			if(cs.name == name)
				this.columns.splice(i,1);
		}
		delete this.columns[name];
	}

	columnsByNameReindex(){
		/** @var Steel__GridColumn */
		this.columnsByName = {};
		for(let i=0; i<this.columns.length; i++){
			let column = this.columns[i];
			this.columnsByName[column.name] = column;
		}
	}

	columnSettingsModify(name, props){

		if(!this.settings.columnsSettingsByName[name]){

			let propsWithName = {name:name};
			for(var key in obj) {
				propsWithName[key] = props[key];
			}

			let cs = this.settings.columnSettingsAdd(propsWithName);

			let col = this.columnsByName[name];
			if(col){
				col.settings = cs;
			}
			return;
		}

		this.settings.columnsSettingsByName[name].applyProperties(props);
	}

	/**
	 * harmonizes columns of grid with fields in fetched data
	 *
	 * @param {Steel__DataProviderField[]|array} fieldsAvailable
	 */
	fieldsAvailableUpdate(fieldsAvailable){
		this.initIfNeed();

		let fieldsAvaliableOld = this.fieldsAvailable;
		this.fieldsAvailable = [];
		this.fieldsAvailableByName = {};

		for(let i=0; i<this.columns; i++){
			this.columns[i].field = null;
		}

		if(fieldsAvailable){
			for(let i=0; i< fieldsAvailable.length; i++){
				let pf = fieldsAvailable[i];
				let f = null;
				if(pf instanceof Steel__DataProviderField) f=pf;
				else if(Steel.isAssociativeArray(pf)) f = new Steel__DataProviderField(pf);
				else throw "unable to create from Steel__DataProviderField from gived value";
				this.fieldsAvailable.push(f);
				this.fieldsAvailableByName[f.name] = f;
				let col = this.columnsByName[f.name];
				if(col) col.field = f;
			}
		}


		if(JSON.stringify(fieldsAvaliableOld) != JSON.stringify(this.fieldsAvailable)){
			//console.log("fieldsAvailable changed: ", JSON.stringify(fieldsAvaliableOld), "->", JSON.stringify(this.fieldsAvailable));
			this.needRender.header = true;
		}


		if(this.settings.isColumnsAutogenerated){
			this.columnsRecreate();
		}
	}


	/** @returns int */
	calcContainerWidth(){
		//return Math.max(this.$elemContainer.innerWidth(),200);
		return this.$root.innerWidth();
	}



	columnsCalculateWidthAuto(){

		if(this.settings.fixedWidth == null){
			return; // browser resizes himself
		}

		this.initIfNeed();

		let containerWidth = this.calcContainerWidth();

		let totalWidthAuto = containerWidth;

		let colsAutoWidthContentMax = {};

		for(let i=0; i<this.columns.length; i++){
			let col = this.columns[i];
			if(col.settings && col.settings.width != null){
				totalWidthAuto -= col.settings.width;
				col.widthAuto = col.settings.width;
			}
			else{
				colsAutoWidthContentMax[col.name] = col.title * 10;
			}
		}
		let colsAutoCount = Object.keys(colsAutoWidthContentMax).length;

		let WIDTH_MIN = 50;

		let totalWidthAutoAvailableForExtra = totalWidthAuto - colsAutoCount * WIDTH_MIN;

		if(totalWidthAutoAvailableForExtra<=0){
			// insufficient place even for minimum size columns

			let widthMin = Math.max( Math.floor(totalWidthAuto/colsAutoCount),3);
			for(let i=0; i<this.columns.length; i++){
				let col = this.columns[i];
				if(!col.settings || col.settings.width == null){
					col.widthAuto = widthMin;
				}
			}
			return;
		}

		//so we have some space

		if(this.rowsData){
			for(let i=0; i<this.rowsData.length; i++){
				let row = this.rowsData[i];
				for(let colName in row){
					let col = this.columnsByName[colName];
					if(col.settings && col.settings.width) continue;
					let val = ""+row[colName];
					let valWidth = val.length * 10; // yeah, this is dirty
					colsAutoWidthContentMax[colName] = Math.max( colsAutoWidthContentMax[colName], valWidth);
				}
			}
		}

		/** @var int[string] columns that have size more then minimum */
		let colsAutoHaveExtraWidth = {};


		let totalWidthContentAutoExtra = 0;
		for(let i=0; i<this.columns.length; i++){
			let col = this.columns[i];
			if( (!col.settings || col.settings.width == null) && colsAutoWidthContentMax[col.name] > WIDTH_MIN ){
				colsAutoHaveExtraWidth[col.name] = col;
				totalWidthContentAutoExtra += colsAutoWidthContentMax[col.name] - WIDTH_MIN;
			}

		}

		let ratioExtra = totalWidthContentAutoExtra ? totalWidthAutoAvailableForExtra / totalWidthContentAutoExtra : 1;
		ratioExtra = Math.min(ratioExtra, 1);

		//console.log("colsAutoWidthContentMax",colsAutoWidthContentMax);
		//console.log("columnsByName",this.columnsByName);

		for(let colName in colsAutoWidthContentMax){
			let col = this.columnsByName[colName];

			let widthContentMax = colsAutoWidthContentMax[colName];
			col.widthAuto = WIDTH_MIN + Math.floor( Math.max(widthContentMax - WIDTH_MIN, 0) * ratioExtra);
		}

	}

	static test_columnsCalculateWidthAuto1()
	{
		let grid = new Steel__Grid(null);
		window.g = grid;
		grid.calcContainerWidth = function(){ return 400; };

		let colsProps = [
			{'name':'id','width':10},
			{'name':'name'},
			{'name':'description'}
		];
		for(let i=0; i<colsProps.length; i++){
			grid.columns.push(new Steel__GridColumn(colsProps));
		}

		grid.rowsData = [
			{cellsData: {id:12312, name:'Edklif', description: 'DEsdasdlelasldleksdasdedded'} },
			{cellsData: {id:32, name:'Edklif2', description: 'dd '} },
			{cellsData: {id:532, name:'Edklif3', description: 'leed'} }
		];

		grid.initIfNeed();

		grid.columnsCalculateWidthAuto();

		console.log("test_columnsCalculateWidthAuto1 columns:", grid.columns, 'rowsData:', rowsData);

	}


	/**
	 * @param {*} val
	 * @param {Steel__DataProviderField} field
	 * @return {*}
	 */
	static convertValueToFieldDataType(val, field){
		let res = null;
		if(!field) return val;

		let valStr  = ""+val;

		if(field.allowNull && [Steel.ENUM_PROVIDER_DATA_TYPE.INT, Steel.ENUM_PROVIDER_DATA_TYPE.TIMESTAMP, Steel.ENUM_PROVIDER_DATA_TYPE.DOUBLE, Steel.ENUM_PROVIDER_DATA_TYPE.BOOL].indexOf(field.dataType)>-1 ){
			if(val == null || val == undefined || valStr.toLowerCase().trim()=="null" || valStr.trim()==""){
				return null;
			}
		}

		switch(field.dataType){
			case Steel.ENUM_PROVIDER_DATA_TYPE.STRING:

				if(val == null && field.allowNull)
					res = null;
				else
					res = valStr;
				break;
			case Steel.ENUM_PROVIDER_DATA_TYPE.INT:
				res = Math.round(parseFloat(val));
				if(isNaN(res)) res = 0;
				break;


			case Steel.ENUM_PROVIDER_DATA_TYPE.TIMESTAMP:
				if(isNumber(val)){ // so this is amount of MILLISECONDS since 1970
					res = parseFloat(val)/1000;
				}
				else{ // so this is string in one of canonical views
					res = (1 * new Date(val)) / 1000;
				}
				if(isNaN(res)) res = 0;
				break;

			case Steel.ENUM_PROVIDER_DATA_TYPE.DOUBLE:
				val = parseFloat( valStr.replace(",",".") );
				if(isNaN(res)) res = 0;
				break;
			case Steel.ENUM_PROVIDER_DATA_TYPE.BOOL:
				valStr = valStr.trim().toLowerCase();
				if(valStr=="true")
					res = true;
				else if(valStr == "false")
					res = false;
				else
					res = parseInt(valStr) ? true : false;
				break;
			default:
				throw "unsupported field type `"+field.dataType+"` of field `"+field.name+"`!";
		}
		return res;
	}


	doInsert(){


		let packets = [];

		// changing sorting so new records allways will be at top of list:
		if(!Steel__isSet(this.keyFieldName)){
			throw 'dataprovider not provided keyFieldName! unable make inserts';
		}
		this.sorting = [this.keyFieldName, -1];

		// also reset position:
		this.settings.offset = 0;

		this.isInsertIdMode = true;



		packets.push( new Steel__PacketClientGridInsertId());
		packets.push( this.packetFetchMake() );

		this.settings.dataProvider.request(this, packets);
	}

	/**
	 * @param {Steel__GridRow} row
	 */
	setCurrentRow(row){
		if(this.currentRow == row) return;

		if(this.currentRow) this.currentRow.$row.removeClass('sg_rowCurrent');
		this.currentRow = row;
		if(this.currentRow) this.currentRow.$row.addClass('sg_rowCurrent');
	}

	/**
	 * @param {Steel__GridRow} row
	 */
	doEditStart(row) {
		if(this.isEditing){
			this.doEditStop(1);
		}
		this.isEditing = true;
		this.setCurrentRow(row);

		this.renderRowContent(row, true);

		// todo: how editing will be finished
	}

	/**
	 * @param {Steel__GridRow} row
	 * @param {array} rowDataNew
	 */
	onRowEditFinished(row, rowDataNew){

		if( JSON.stringify(row.rowData) == JSON.stringify(rowDataNew) ){
			return;
		}

		row.rowData = rowDataNew;

		let packetRequest = new Steel__PacketClientGridUpdate();

		packetRequest.keyValue = rowDataNew[this.keyFieldName];
		packetRequest.columnValues = {};
		for(let i=0; i<this.fieldsAvailable.length; i++){
			let field = this.fieldsAvailable[i];
			if(!field.name in rowDataNew) continue;
			packetRequest.columnValues[field.name] = rowDataNew[field.name];
		}

		this.dataProvider.request(this, [packetRequest]);
	}

	doEditStop(isApply, disableRenderRow) {
		if (!this.isEditing) return;
		this.isEditing = false;

		let row = this.currentRow;

		if (isApply) {
			// finding out changed fields and update them

			let rowDataNew = Steel__getProperties(row.rowData);

			for(let i=0; i<row.cells.length; i++){
				let cell = row.cells[i];
				if(cell.column.isReadOnly) continue;
				let valMixedType = cell.getEditorValue(cell);
				rowDataNew[cell.column.name] = Steel__Grid.convertValueToFieldDataType(valMixedType, cell.column.field);
			}

			this.onRowEditFinished(row, rowDataNew);

		}





		if(!disableRenderRow)
			this.renderRowContent(this.currentRow, false);

	}

	/**
	 * @param {Steel__GridRow} row
	 */
	doDelete(row){

		if(!confirm("Вы уверены, что хотите удалить данную запись?")) return;

		if(this.currentRow == row){
			this.doEditStop(0, 1);
		}

		let keyValue = row.rowData[this.keyFieldName];

		let packets = [
			( new Steel__PacketClientGridDelete() ).applyProperties({keyValue:keyValue}),
			this.packetFetchMake()
		];
		this.settings.dataProvider.request(this, packets);

	}

	util__filterSwitch(filterJsonObject, enable) {
		var exists = false;

		var arr = this.settings.filters;
		if (arr) {
			for (var i = 0; i < arr.length; i++){
				var filterCur  = arr[i];
				if(filterCur == filterJsonObject) {
					exists = true;
					if(!enable){
						arr.splice(i,1);
					}
					break;
				}
			}
		}

		if(enable && !exists){
			arr.push(filterJsonObject);
		}

		this.offset = 0;

		this.fetchData();
	}

}
window.Steel__Grid = Steel__Grid;



