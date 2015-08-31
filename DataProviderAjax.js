"use strict";

class Steel__DataProviderAjax extends Steel__DataProvider{

	constructor(urlEndpoint){
		super();

		this.urlEndpoint = urlEndpoint;

		/** @var {bool} use ONLY for read-only providers!!! this option is good for multiple listboxes */
		this.enableCacheResponses = false;

		/** @var {array[string]}  associative array with ALL received packets (any operation); key is json of group of request packets, value is group of resonses */
		this.cacheResponsesGroups = {};

		/** @var {array[string]}  associative array; key is json of group of request packets, value is array of receivers */
		this.waitingForCacheResponses = {};
	}

	/**
	 * @param {Steel__IDataReceiver} receiver
	 * @param {Steel__PacketOutDataProvider[]} requestGroup
	 */
	request(receiver, requestsGroup)
	{

		let jsonRequestsGroup = null;

		let enableCacheResponses = this.enableCacheResponses;

		if(enableCacheResponses){
			jsonRequestsGroup = JSON.stringify(requestsGroup);
			let responsesGroup = this.cacheResponsesGroups[jsonRequestsGroup]
			if(responsesGroup){
				receiver.onDataReceived(responsesGroup);
				return;
			}
			if(this.waitingForCacheResponses[jsonRequestsGroup]){
				this.waitingForCacheResponses.push(receiver);
				return;
			}
			this.waitingForCacheResponses[jsonRequestsGroup] = [receiver];
		}


		// todo: make in possible to send human-readable  GET requests
		var data = {SteelPackets: requestsGroup};

		jQuery.ajax(this.urlEndpoint, {data:data}).done(function(data, textStatus, jqXHR){

            let responses = [];
			for(let i = 0; i<data.length; i++){
		        var response = new Steel__PacketInDataProvider();
				var packet = data[i];
				for(var name in packet){
					response[name] = packet[name];
				}
				responses.push(response);
			}

			if(enableCacheResponses) {
				this.cacheResponsesGroups[jsonRequestsGroup] = responses;
				let waiting = this.waitingForCacheResponses[jsonRequestsGroup];
				delete this.waitingForCacheResponses[jsonRequestsGroup];
				for(let i=0; i < waiting.length; i++){
					waiting[i].onDataReceived(responses);
				}
			}
			else{
				receiver.onDataReceived(responses);
			}


		});
	}


}
Steel.DataProviderAjax = Steel__DataProviderAjax;