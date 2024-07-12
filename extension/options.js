(function() {

	function callback(u) {
		u = document.querySelector('#user-list');
		chrome.storage.local.get('websites_List', function(value) {
			if (value.websites_List !== undefined) {
				for (var i = 0; i < value.websites_List.length; i++) {
					getData(u, value.websites_List[i]);
				}
				empty(u);
			} else {
				return;
			}
		});
	}

	function getData(u, url, mode) {
		var hostname = url;
		var d = document.createElement('div');
		u.appendChild(d);
		d.className = 'table-row';
		if (url.indexOf('#c') !== -1) {
			url = url.replace('#c', '');
			urlFilter = url + '##enable-copy';
			mode = 'enable-copy';
		} else {
			url = url.replace('#a', '');
			urlFilter = url + '##absolute-mode';
			mode = 'absolute-mode';
		}
		d.innerHTML = `
			<div class="row-label" url=${url} mode=${mode} >${urlFilter}</div>
			<i class="row-delete" name=${mode} title="Delete"></i>
		`;
		d.querySelector('.row-delete').addEventListener('click', function () {
			chrome.runtime.sendMessage({
				text: 'delete-url',
				url: hostname
			});
			d.remove();
			empty(u);
		});
	}

	function empty(u) {
		var empty = document.querySelector('.list-empty')
		if (empty !== null && u.querySelectorAll('.table-row')[0] !== null) {
			empty.style.display = 'none';
		}
		if (u.querySelector('.table-row') === undefined || u.querySelector('.table-row') === null ) {
			empty.style.display = 'block';
		}
	}

	window.onload = callback;

})();