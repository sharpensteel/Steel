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
 * custom intial rendering, i.e. making '<select ...></select>'
 * @callback Steel__ListBox__customRenderInitial
 * @param {jQuery} $control rendered by defa!ult
 * @return {jQuery} modified (or not) $control
 */


/**
 * custom rendering of items, i.e. making '<otion>...</option>'
 * @callback Steel__ListBox__customRenderItem
 * @param {jQuery} $item rendered by default
 * @param {array} rowData
 * @return {string}|{jQuery} modified $item
 */


/**
 * generate caption of item, i.e. inner part of '<otion></option>'
 * @callback Steel__ListBox__customGenerateCaption
 * @param {array} rowData
 * @return {string}|{jQuery} something that will be inserted in the inner of '<otion></option>'
 */


	class Steel__ListBox extends Steel__IDataReceiver{
	constructor(props){
		super();

		// REQUIRED SETTINGS

		/** @var {Steel__DataProvider} REQUIRED */
		this.dataProvider = null;


		// OPTIONAL SETTINGS

		/** @var string used in default render of item, if `customGenerateCaption` not set; OPTIONAL */
		this.captionFieldName = null;

		/** @var {Steel__ListBox__customRenderInitial} OPTIONAL */
		this.customRenderInitial = null;

		/** @var {Steel__ListBox__customRenderItem} OPTIONAL */
		this.customRenderItem = null;

		/** @var string values for `value` attributes of items; by default, first field from fetched data used; OPTIONAL */
		this.valueFieldName = null;

		///** @var string[] OPTIONAL */
		//this.sorting = null;

		/** @var {Steel__ListBox__customGenerateCaption} used in default render of item; OPTIONAL */
		this.customGenerateCaption = null;

		/** @var string if set, we will select corresponding item in listbox, after fetching data; OPTIONAL */
		this.valueSelected = null;


		// PRIVATE MEMBERS

		/** @var {jQuery}  PRIVATE */
		this.$control = null;

		/** @var Steel__DataProviderField[]|null  PRIVATE */
		this.fieldsAvailable = null;

		/** @var mixed[];  example: [{'id':78, 'name':'Esda'}, ...]; if this packet is response on change operation, there will be changed rows  PRIVATE */
		this.rowsData = [];

		if(props) this.applyProperties(props);
	}

	/**
	 * @private
	 */
	requestItems(){
		this.dataProvider.request(
			this,
			[
				new Steel__PacketClientDataProvider({
					operation: Steel.ENUM_PACKET_CLIENT_OPERATION.FETCH
					//sorting: this.sorting
				})
			]
		)
	}

	/**
	 * renders listBox in `elemContainer`;
	 * automaticly requests items from `dataProvider`
	 *
	 * @param {HTMLElement|jQuery|undefined} elemContainer optional if set, new listbox will be appened to it;  OPTIONAL
	 * @return {jQuery} created list item
	 */
	render(elemContainer){
		let $control = $('<select class="Steel__ListBox"></select>');
		if(this.customRenderInitial){
			$control = this.customRenderInitial($control);
		}
		$control.data('Steel__ListBox', this);

		this.$control = $control;
		this.requestItems();


		if(elemContainer){
			$(elemContainer).append($control);
		}

		return $control;
	}

	/**
	 * @private
	 * @param {Steel__PacketServerDataProvider[]} packets
	 */
	onDataReceived(packets){
		for(let ipacket=0; ipacket<packets.length; ipacket++){
			let packet = packets[ipacket];
			if(packet.operation != Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_FETCH){
				continue; // we don't know what to do with other packets, we not expecting them
			}

			if(!this.valueFieldName && packet.keyFieldName){
				this.valueFieldName = packet.keyFieldName;
			}

			this.fieldsAvailable = packet.fieldsAvailable;
			this.rowsData = packet.rows;

			this.renderItems();
		}
	}

	renderItems(){
		this.$control.html('');

		if(!this.rowsData.length) return;

		//let allowNull = !this.fieldsAvailable || !("allowNull" in this.fieldsAvailable) || this.fieldsAvailable.allowNull;

		let valueFieldName = this.valueFieldName;
		if(!valueFieldName && this.fieldsAvailable && this.fieldsAvailable.length){
			valueFieldName = this.fieldsAvailable[0].name;
		}
		if(!valueFieldName){
			for(let fieldName in this.rows[0]){ valueFieldName = fieldName; break; }
		}

		if(!valueFieldName && console && console.error){ console.error('Steel__ListBox: `keyFieldName` property not set!'); }

		let captionFieldName = this.captionFieldName;
		if(!captionFieldName) captionFieldName = valueFieldName;

		for(let i=0; i<this.rowsData.length; i++){
			let rowData = this.rowsData[i];
			let caption = '';

			if(this.customGenerateCaption){
				caption = this.customGenerateCaption(rowData);
			}
			else{
				caption = rowData[captionFieldName];
			}

			let $item = $('<option></option>');

			$item.html(caption).attr({
				value: rowData[valueFieldName],
				'class': 'slb_item'
			});

			if(this.customRenderItem){
				$item = this.customRenderItem($item, rowData);
			}
			this.$control.append($item);
		}

		if(this.valueSelected != null){
			this.$control.val(this.valueSelected);
		}

		let _ = this;
		this.$control.on('change',function(){
			let newValue = _.getSelectedValue();
			_.$control.trigger('Steel__ListBox:ValueChanged',newValue);
		});

	}

	/** @return returns value of selected item in listbox */
	getSelectedValue() {
		let c = this.$control[0];
		return c.options[c.selectedIndex].value;
	}


	/**
	 * @param {function(*, *)} handler when editor value changes, handler(event, newValue) called
	 * @returns {string} eventUid for unregister
	 */
	registerOnEditorValueChanged(handler){
		var eventUid = 'Steel__ListBox:ValueChanged.UID'+Math.floor(Math.random()*100000000000);
		this.$control.on(eventUid,handler);
		return eventUid;
	}

	unregisterOnEditorValueChanged(eventUid){
		return this.$control.off(eventUid);
	}
}
window.Steel__ListBox = Steel__ListBox;

