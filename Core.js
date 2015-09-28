"use strict";

/*
 * This file is part of Steel library.
 *
 * (c) Dmitry Sobchenko <sharpensteelgmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


window.Steel = window.Steel || {};

Steel.EXCEPTION__NOT_IMPLEMENTED = window.Steel__EXCEPTION__NOT_IMPLEMENTED = "EXCEPTION__NOT_IMPLEMENTED";
Steel.EXCEPTION__ABSTRACT_METHOD = window.Steel__EXCEPTION__ABSTRACT_METHOD = "EXCEPTION__ABSTRACT_METHOD";

window.Steel__ENUM_PROVIDER_DATA_TYPE = {
	STRING: 'STRING',
	INT: 'INT',
	DOUBLE: 'DOUBLE',
	BOOL: 'BOOL',
	TIMESTAMP: 'TIMESTAMP'
}
Steel.ENUM_PROVIDER_DATA_TYPE = window.Steel__ENUM_PROVIDER_DATA_TYPE;

window.Steel__ENUM_PACKET_CLIENT_OPERATION = {
	FETCH: 'FETCH',
	INSERT_ID: 'INSERT_ID', // inserts empty record to get ID of new record; need FETCH packet after
	UPDATE: 'UPDATE',
	DELETE: 'DELETE'
};
Steel.ENUM_PACKET_CLIENT_OPERATION = window.Steel__ENUM_PACKET_CLIENT_OPERATION;

window.Steel__ENUM_PACKET_SERVER_OPERATION = {
	AFTER_FETCH: 'AFTER_FETCH',
	AFTER_INSERT_ID: 'AFTER_INSERT_ID',
	AFTER_UPDATE: 'AFTER_UPDATE',
	AFTER_DELETE: 'AFTER_DELETE',
	ERROR: 'ERROR'
};
Steel.ENUM_PACKET_SERVER_OPERATION = window.Steel__ENUM_PACKET_SERVER_OPERATION;


class Steel__IConfigurable{
	/** @abstract */
	configure(props){ throw Steel__EXCEPTION__ABSTRACT_METHOD; }

	/** @abstract */
	getConfiguration(){ throw Steel__EXCEPTION__ABSTRACT_METHOD;	}
}
window.Steel__IConfigurable = Steel__IConfigurable;


class Steel__ArrayWithAssociative extends Steel__IConfigurable{

	constructor(keyName){
		super();

		this._keyNameAssociative = keyName;

		/** private */
		this._arr = [];

		/** private */
		this._arrAssociative = {};
	}


 	getByIndex(index){
		return this._arr[index];

	}

	getByKey(keyValue){
		return this._arrAssociative[keyValue];
	}

	push(elem){
		let keyValue = elem[this._keyNameAssociative];
		this._arrAssociative[keyValue] = elem;
		this._arr.push(elem);
		return elem;
	}

	remove(index){
		let elem = this._arr[index];
		this._arr.splice(index, 1);
		if(elem){
			delete this._arrAssociative[ elem[this._keyNameAssociative] ];
		}
	}

	/**
	 * @param {function(Array)} funcChange parameter passed: this._arr
	 */
	arbitraryArrChange(funcChange){
		funcChange(this._arr);
		this.reindex();
	}

	reindex(){
		this._arrAssociative = {};
		for(let i=0; i<this._arr.length; i++){
			let elem = this._arr[i];
			this._arrAssociative[elem[this._keyNameAssociative]] = elem;
		}
	}

	/**
	 * implementation of Steel__IConfigurable.configure()
	 * @param {Array} newArr
	 */
	configure(newArr){
		this._arr = newArr.slice();
		this.reindex();
	}

	/**
	 * implementation of Steel__IConfigurable.getConfiguration()
	 */
	getConfiguration(){
		this._arr;
	}

	get length(){ return this._arr.length; }


}
window.Steel__ArrayWithAssociative = Steel__ArrayWithAssociative;

/** @returns {bool} true if argument not undefined/null/NaN */
function Steel__isObject(a){ return a == Object(a); }
Steel.isObject = window.Steel__isObject = Steel__isObject;

function Steel__isAssociativeArray(a){ return a == Object(a) && !(a instanceof Array) && (a.constructor.name == "Object" || a.constructor == Object); }
Steel.isAssociativeArray = window.Steel__isAssociativeArray = Steel__isAssociativeArray;

function Steel__isSet(a){ return a != undefined && !(typeof a == 'number' && isNaN(a)) && a != null; }
Steel.isSet = window.Steel__isSet = Steel__isSet;

function Steel__htmlEscape(str) {
	return String(str)
		.replace(/&/g, '&amp;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;');
}
Steel.htmlEscape = window.Steel__htmlEscape = Steel__htmlEscape;

function Steel__htmlUnescape(value){
	return String(value)
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&amp;/g, '&');
}
Steel.htmlUnescape = window.Steel__htmlUnescape = Steel__htmlUnescape;


function Steel__applyProperties(obj, props){

	if( Steel__isObject(obj) &&  obj instanceof Steel__IConfigurable){
		obj.configure(props);
	}

	for(var propName in props){
		if(!(propName in obj)){ throw "class `"+obj.constructor.name+"` don't have property `"+propName+"`";}
		var newPropVal = props[propName];

		var currentPropVal = obj[propName];
		if(currentPropVal == newPropVal) continue;

		if( Steel__isObject(currentPropVal) ){
			if( currentPropVal instanceof Steel__Component){
				currentPropVal.applyProperties(newPropVal);
			}
			else if(currentPropVal instanceof Steel__IConfigurable){
				currentPropVal.configure(newPropVal);
			}
			else if( Steel__isAssociativeArray(currentPropVal) ){
				// recursive call
				Steel__applyProperties(currentPropVal, newPropVal);
			}
			else{
				obj[propName] = newPropVal;
			}
		}
		else{
			obj[propName] = newPropVal;
		}
	}
}
Steel.applyProperties = window.Steel__applyProperties = Steel__applyProperties;


/** makes shallow copy of object or associative array */
function Steel__getProperties(obj){

	if( !Steel__isObject(obj) ) return obj;

	let props = {};

	for(var propName in obj){
		props[propName] = obj[propName];
	}
	return props;
}
Steel.getProperties = window.Steel__getProperties = Steel__getProperties;


class Steel__Component{
	constructor(){

	}

	applyProperties(props){
		Steel__applyProperties(this, props);
		return this;
	}
}
window.Steel__Component = Steel__Component;


class Steel__TagRenderParams{
	constructor(props){

		/** @var {string} */
		this.tag = '';

		/** @var {array} the element attributes. The values will be HTML-encoded. If an 'encode' attribute is given and its value is false, the rest of the attribute values will NOT be HTML-encoded. attributes whose value is null will not be rendered. */
		this.htmlAttributes = null;

		/** @var {string} */
		this.content = '';

		/** @var {bool} */
		this.isClosingTag = true;

		if(props) this.applyProperties(props);
	}

	/**
	 * @param {Steel__TagRenderParams|array} params
	 */
	static render(params){
		let html = '<'+params.tag;

		var doEncode = true;
		for(let attrName in params.htmlAttributes) {
			let attrVal = params.htmlAttributes[encattrNameode];
			if (attrName == 'encode') {
				doEncode = attrVal;
				continue;
			}
			html += ' '+attrName+'="'+ ( doEncode ? Steel__htmlEscape( attrVal ) : attrVal) +'"';
		}
		if(params.isClosingTag){
			html += '>' + params.content + "<" + params.tag + ">"
		}
		else{
			html += '/>' ;
		}
		return html;
	}
}
window.Steel__TagRenderParams = Steel__TagRenderParams;



class Steel__IDataReceiver extends Steel__Component{

	/**
	 * @param {Steel__PacketServerDataProvider[]} packets
	 */
	onDataReceived(packets){ throw Steel__EXCEPTION__ABSTRACT_METHOD; }

}
window.Steel__IDataReceiver = Steel__IDataReceiver;



///////////////////////////////////////////////////////////////////////////////////////////////////////
// packets
///////////////////////////////////////////////////////////////////////////////////////////////////////

class Steel__PacketServerDataProvider extends Steel__Component{

	constructor(props){
		super();

		/** @var {Steel__ENUM_PACKET_SERVER_OPERATION}  */
		this.operation = null;

		this.errorMessage = null;
		this.errorRequest = null;

		if(props) this.applyProperties(props);
	}

};
window.Steel__PacketServerDataProvider = Steel__PacketServerDataProvider;


class Steel__PacketServerDataProviderFetch extends Steel__PacketServerDataProvider{

	constructor(props){
		super();

		/** @var {Steel__DataProviderField[]|null} */
		this.fieldsAvailable = null;

		/** @var {mixed[]}  example: [{'id':78, 'name':'Esda'}, ...]; if this packet is response on change operation, there will be changed rows   */
		this.rows = [];

		/** @var {string} */
		this.keyFieldName = null;

		if(props) this.applyProperties(props);
	}

	/**
	 * @param {Steel__PacketServerDataProviderFetch} packet
	 */
	static generateFieldsAvailableByRows(packet){
		packet.fieldsAvailable = [];
		if(!packet.rows || !packet.rows.length){
			return;
		}

		var row = packet.rows[0];

		for(let fieldName in row){
			let field = new Steel__DataProviderField();
			field.name = fieldName;
			packet.fieldsAvailable.push(field);
		}
	}

};
window.Steel__PacketServerDataProviderFetch = Steel__PacketServerDataProviderFetch;


class Steel__PacketClientDataProvider extends Steel__Component{

	constructor(props){
		super();

		/** @var string one of Steel__ENUM_PACKET_CLIENT_OPERATION constants */
		this.operation = null;

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketClientDataProvider = Steel__PacketClientDataProvider;


class Steel__PacketClientDataProviderAfterInsertId extends Steel__PacketClientDataProvider{

	constructor(props){
		super();

		this.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_INSERT_ID;

		/** @var mixed key of newly inserted record; example: 68392 */
		this.keyValue = null;

		if(props) this.applyProperties(props);
	}
};
window.Steel__PacketClientDataProviderAfterInsertId = Steel__PacketClientDataProviderAfterInsertId;

///////////////////////////////////////////////////////////////////////////////////////////////////////
//  end of packets
///////////////////////////////////////////////////////////////////////////////////////////////////////




class Steel__DataProviderField extends Steel__Component{

	constructor(props){
		super();

		this.isReadOnly = 0;

		this.dataType = Steel__ENUM_PROVIDER_DATA_TYPE.STRING;

		this.title = null;

		this.name = null;

		this.allowNull = true;

		if(props) this.applyProperties(props);
	}

}
window.Steel__DataProviderField = Steel__DataProviderField;


class Steel__DataProvider extends Steel__Component{

	constructor(){
		super();

		/** @var Steel__DataProviderField[] */
		this.fields = [];

	}

	/**
	 *
	 * @param {Steel__IDataReceiver} receiver
	 * @param {Steel__PacketClientDataProvider[]} packets
	 *
	 */
	request(receiver, packets){ throw Steel__EXCEPTION__ABSTRACT_METHOD; }

}
window.Steel__DataProvider = Steel__DataProvider;



