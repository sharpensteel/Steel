"use strict";

/*
 * This file is part of Steel library.
 *
 * (c) Dmitry Sobchenko <sharpensteelgmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */


class Steel__DataProviderStatic extends Steel__DataProvider{

	/**
	 * @param {null|Steel__DataProviderField[]} fields
	 * @param {array} rows
	 * @param {string} keyFieldName
	 */
	constructor(fields, rows, keyFieldName){
		super();

		this.fields = fields;
		this.rows = rows;
		this.keyFieldName = keyFieldName;
	}


	/**
	 * @param {Steel__IDataReceiver} receiver
	 * @param {Steel__PacketClientDataProvider[]} packets
	 */
	request(receiver, packets)
	{
		var responses = [];
		for(var i=0; i<packets.length; i++){
			var packet = packets[i];
			if(packet.operation != Steel.ENUM_PACKET_CLIENT_OPERATION.FETCH){
				throw Steel.EXCEPTION__NOT_IMPLEMENTED;
			}

			var response = new Steel__PacketServerGridAfterFetch(); // Steel__PacketServerGridAfterFetch

			response.operation = Steel.ENUM_PACKET_SERVER_OPERATION.AFTER_FETCH;
			response.fieldsAvailable = this.fields;
			response.rows = this.rows;
			response.keyFieldName = this.keyFieldName;
			//response.totalRows = this.rows.length;


			responses.push(response);
		}
		receiver.onDataReceived(responses);
	}


}
window.Steel__DataProviderStatic = Steel__DataProviderStatic;