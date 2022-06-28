var table = []
var windowIsOpened = false
var selectedWindow = "none"
var item = null

// Windows
window.addEventListener('message', function(event) {
	item = event.data;
	switch (event.data.action) {
		case 'mainmenu':
			if (!windowIsOpened) {
				var popup = new Audio('popup.mp3');
				popup.volume = 0.4;
				popup.play();

				windowIsOpened = true
				
				if (event.data.society == true){
					row = `	<div class="col col-md-4">
								<div class="card h-100">
								  <div class="card-body text-center mainmenu-subcard" id="menuMyInvoices" style="background-color: #eeeff3; color: #2f3037;">
								    <span class="card-title" style="font-size: 30px;"><i class="fas fa-user"></i></span>
								    <p class="card-text">Personal Invoices</p>
								  </div>
								</div>
							</div>
							<div class="col col-md-4">
								<div class="card h-100">
								  <div class="card-body text-center mainmenu-subcard" id="menuSocietyInvoices" style="background-color: #eeeff3; color: #2f3037;">
								    <span class="card-title" style="font-size: 30px;"><i class="fas fa-building"></i></span>
								    <p class="card-text">Society Invoices</p>
								  </div>
								</div>
							</div>
							<div class="col col-md-4">
								<div class="card h-100">
								  <div class="card-body text-center mainmenu-subcard" id="menuCreateInvoice" style="background-color: #eeeff3; color: #2f3037;">
								    <span class="card-title" style="font-size: 30px;"><i class="fas fa-paper-plane"></i></span>
								    <p class="card-text">Create Invoice</p>
								  </div>
								</div>
							</div>
						  `
				} else if(event.data.create & !event.data.society){
					row = `	<div class="d-flex justify-content-center">
								<div class="col col-md-4">
									<div class="card h-100">
									  <div class="card-body text-center mainmenu-subcard" id="menuMyInvoices" style="background-color: #eeeff3; color: #2f3037;">
									    <span class="card-title" style="font-size: 30px;"><i class="fas fa-user"></i></span>
									    <p class="card-text">Personal Invoices</p>
									  </div>
									</div>
								</div>
								<div class="col col-md-4" style="margin-left: 25px;">
									<div class="card h-100">
									  <div class="card-body text-center mainmenu-subcard" id="menuCreateInvoice" style="background-color: #eeeff3; color: #2f3037;">
									    <span class="card-title" style="font-size: 30px;"><i class="fas fa-paper-plane"></i></span>
									    <p class="card-text">Create Invoice</p>
									  </div>
									</div>
								</div>
							</div>
						  `
				} else if(!event.data.create & !event.data.society){
					row = `	<div class="d-flex justify-content-center">
								<div class="col col-md-4">
									<div class="card h-100">
									  <div class="card-body text-center mainmenu-subcard" id="menuMyInvoices" style="background-color: #eeeff3; color: #2f3037;">
									    <span class="card-title" style="font-size: 30px;"><i class="fas fa-user"></i></span>
									    <p class="card-text">Personal Invoices</p>
									  </div>
									</div>
								</div>
							</div>
						  `
				}

				$(".mainmenu").fadeIn();
				$("#mainMenuData").html(row);
				selectedWindow = "mainMenu"
			}
			break
		case 'myinvoices':
			if (!windowIsOpened) {
				var popup = new Audio('popup.mp3');
				popup.volume = 0.4;
				popup.play();

				var row = "";

				for(var i=0; i<event.data.invoices.length; i++)
				{
					var invoices = event.data.invoices[i];
					var tablestatus = "";

					if (invoices.status == 'paid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-success" style="font-size: 14px;"><i class="fas fa-check-circle"></i> PAID</span></td>';
						modalstatus = '<span class="badge bg-success" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-check-circle"></i> PAID</span>';
						payment_status = `<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">PAID ON: ${invoices.paid_date}</span>`;
					}
					else if (invoices.status == 'unpaid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-danger" style="font-size: 14px;"><i class="fas fa-times-circle"></i> DUE</span></td>';
						modalstatus = '<span class="badge bg-danger" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-times-circle"></i> DUE</span>';
						payment_status = `<button type="button" id="" class="btn btn-blue flex-grow-1 payInvoice" style="border-radius: 10px; flex-basis: 100%;" data-invoiceId="${invoices.id}" data-invoiceMoney="${invoices.invoice_value}" data-bs-dismiss="modal"><i class="fas fa-shopping-bag"></i> PAY ${invoices.invoice_value.toLocaleString()}&euro;</button>`;
					}
					else if (invoices.status == 'autopaid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-info" style="font-size: 14px;"><i class="fas fa-clock"></i> AUTOPAID</span></td>';
						modalstatus = '<span class="badge bg-info" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-clock"></i> AUTOPAID</span>';
						payment_status = `<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">AUTOPAID ON: ${invoices.paid_date}</span>`;
					}
					else if (invoices.status == 'cancelled') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-secondary" style="font-size: 14px;"><i class="fas fa-minus-circle"></i> CANCELLED</span></td>';
						modalstatus = '<span class="badge bg-secondary" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-minus-circle"></i> CANCELLED</span>';
						payment_status = '<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">CANCELLED</span>'
					}

					if (invoices.limit_pay_date == 'N/A') {
						limit_pay_date = ''
					} else {
						limit_pay_date = `<h6>Due: ${invoices.limit_pay_date}</h6>`
					}

					row += `
						<tr>
							<td class="text-center align-middle">${invoices.id}</td>
							${tablestatus}
							<td class="text-center align-middle">${invoices.society_name}</td>
							<td class="text-center align-middle">${invoices.item}</td>
							<td class="text-center align-middle">${invoices.invoice_value.toLocaleString()}€</td>
							<td class="text-center align-middle"><button type="button" class="btn btn-blue showInvoice" style="border-radius: 10px; flex-basis: 100%;" data-toggle="modal" data-target="#showInvoiceModal${invoices.id}" data-invoiceId="${invoices.id}""><i class="fas fa-eye"></i> VIEW</button></td>
						</tr>
					`;

					var modal = `<div class="modal fade" id="showInvoiceModal${invoices.id}" tabindex="-1">
									<div class="modal-dialog modal-dialog-centered">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<span class="menutitle">Invoice #${invoices.id}</span>
												${modalstatus}
												<h6 class="" id="" style="">Sent: ${invoices.sent_date}</h6>
												${limit_pay_date}
												<h6 class="" id="" style="margin-top: 20px;">To: <span style="color: #2f3037;">${invoices.receiver_name}</span></h6>
												<h6 class="" id="" style="">From: <span style="color: #2f3037;">${invoices.author_name}</span></h6>
												<hr>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">${invoices.item}</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value - Math.round(invoices.invoice_value * (event.data.VAT/100))).toLocaleString()} &euro;</span>
												</div>
												<hr>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">Subtotal</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value - Math.round(invoices.invoice_value * (event.data.VAT/100))).toLocaleString()} &euro;</span>
												</div>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">VAT (${event.data.VAT}%)</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value * (event.data.VAT/100)).toLocaleString()} &euro;</span>
												</div>
												<br>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px; font-weight: 700;">Total</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value).toLocaleString()} &euro;</span>
												</div>
												<br>
												<div class="d-flex justify-content-center">
													${payment_status}
												</div>
												<br>
												<div class="d-flex justify-content-center">
													<textarea class="form-control" readonly>${invoices.notes}</textarea>
												</div>
											</div>
										</div>
									</div>
								</div>
								`;
					$("body").append(modal);
				}
				$("#myInvoicesData").html(row);

				const myinvoices = document.getElementById('myInvoices');
				table.push(new simpleDatatables.DataTable(myinvoices, {
					searchable: true,
					perPageSelect: false,
					perPage: 5,
				}));

				windowIsOpened = true

				selectedWindow = "myinvoices"
				$(".myinvoices").fadeIn();
			}
			break
		case 'createinvoice':
			if (!windowIsOpened) {
				windowIsOpened = true
				$("#sendInvoiceSubtitle").html(event.data.society);
				$(".sendinvoice").fadeIn();
				selectedWindow = "createinvoice"
			}
			break
		case 'societyinvoices':
			if (!windowIsOpened) {
				var popup = new Audio('popup.mp3');
				popup.volume = 0.4;
				popup.play();

				var row = "";

				for(var i=0; i<event.data.invoices.length; i++)
				{
					var invoices = event.data.invoices[i];
					var data = event.data
					var tablestatus = "";

					$("#societyInvoicesTitle").html(invoices.society_name);
					$("#totalInvoices").html(data.totalInvoices);
					$("#totalIncome").html(`${data.totalIncome.toLocaleString()}€`);
					$("#unpaidInvoices").html(data.totalUnpaid);
					$("#awaitedIncome").html(`${data.awaitedIncome.toLocaleString()}€`);

					if (invoices.status == 'paid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-success" style="font-size: 14px;"><i class="fas fa-check-circle"></i> PAID</span></td>';
						modalstatus = '<span class="badge bg-success" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-check-circle"></i> PAID</span>';
						payment_status = `<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">PAID ON: ${invoices.paid_date}</span>`;
					}
					else if (invoices.status == 'unpaid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-danger" style="font-size: 14px;"><i class="fas fa-times-circle"></i> DUE</span></td>';
						modalstatus = '<span class="badge bg-danger" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-times-circle"></i> DUE</span>';
						payment_status = `<button type="button" id="" class="btn btn-red flex-grow-1 cancelInvoice" style="border-radius: 10px; flex-basis: 100%;" data-invoiceId="${invoices.id}" data-invoiceMoney="${invoices.invoice_value}" data-bs-dismiss="modal"><i class="fas fa-times-circle"></i> CANCEL INVOICE</button>`;
					}
					else if (invoices.status == 'autopaid') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-info" style="font-size: 14px;"><i class="fas fa-clock"></i> AUTOPAID</span></td>';
						modalstatus = '<span class="badge bg-info" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-clock"></i> AUTOPAID</span>';
						payment_status = `<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">AUTOPAID ON: ${invoices.paid_date}</span>`;
					}
					else if (invoices.status == 'cancelled') {
						tablestatus = '<td class="text-center align-middle"><span class="badge bg-secondary" style="font-size: 14px;"><i class="fas fa-minus-circle"></i> CANCELLED</span></td>';
						modalstatus = '<span class="badge bg-secondary" style="position: absolute; right: 5%; top: 5%; font-size: 18px;"><i class="fas fa-minus-circle"></i> CANCELLED</span>';
						payment_status = '<span style="font-size: 20px; color: #2f3037; text-transform: uppercase; font-weight: 600;">CANCELLED</span>'
					}

					if (invoices.limit_pay_date == 'N/A') {
						limit_pay_date = ''
					} else {
						limit_pay_date = `<h6>Due: ${invoices.limit_pay_date}</h6>`
					}

					row += `
						<tr>
							<td class="text-center align-middle">${invoices.id}</td>
							${tablestatus}
							<td class="text-center align-middle">${invoices.receiver_name}</td>
							<td class="text-center align-middle">${invoices.item}</td>
							<td class="text-center align-middle">${invoices.invoice_value.toLocaleString()}€</td>
							<td class="text-center align-middle"><button type="button" class="btn btn-blue showInvoice" style="border-radius: 10px; flex-basis: 100%;" data-toggle="modal" data-target="#showInvoiceModal${invoices.id}" data-invoiceId="${invoices.id}""><i class="fas fa-eye"></i> VIEW</button></td>
						</tr>
					`;

					var modal = `<div class="modal fade" id="showInvoiceModal${invoices.id}" tabindex="-1">
									<div class="modal-dialog modal-dialog-centered">
										<div class="modal-content myinvoices_modal-content">
											<div class="modal-body p-4">
												<span class="menutitle">Invoice #${invoices.id}</span>
												${modalstatus}
												<h6 class="" id="" style="">Sent: ${invoices.sent_date}</h6>
												${limit_pay_date}
												<h6 class="" id="" style="margin-top: 20px;">To: <span style="color: #2f3037;">${invoices.receiver_name}</span></h6>
												<h6 class="" id="" style="">From: <span style="color: #2f3037;">${invoices.author_name}</span></h6>
												<hr>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">${invoices.item}</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value - Math.round(invoices.invoice_value * (event.data.VAT/100))).toLocaleString()} &euro;</span>
												</div>
												<hr>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">Subtotal</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value - Math.round(invoices.invoice_value * (event.data.VAT/100))).toLocaleString()} &euro;</span>
												</div>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px;">VAT (${event.data.VAT}%)</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value * (event.data.VAT/100)).toLocaleString()} &euro;</span>
												</div>
												<br>
												<div class="d-flex justify-content-between">
													<span class="" id="" style="color: #2f3037; font-size: 20px; font-weight: 700;">Total</span> <span class="" id="" style="font-size: 18px;">${Math.round(invoices.invoice_value).toLocaleString()} &euro;</span>
												</div>
												<br>
												<div class="d-flex justify-content-center">
													${payment_status}
												</div>
												<br>
												<div class="d-flex justify-content-center">
													<textarea class="form-control" readonly>${invoices.notes}</textarea>
												</div>
											</div>
										</div>
									</div>
								</div>
								`;
					$("body").append(modal);
				}
				$("#societyInvoicesData").html(row);

				const societyinvoices = document.getElementById('societyInvoices');
				table.push(new simpleDatatables.DataTable(societyinvoices, {
					searchable: true,
					perPageSelect: false,
					perPage: 5,
				}));

				windowIsOpened = true

				selectedWindow = "societyinvoices"
				$(".societyinvoices").fadeIn();
			}
			break
	}
});

// Button Actions
$(document).on('click', ".showInvoice", function() {
	var modalId = $(this).attr('data-target');
	var invoiceModal = new bootstrap.Modal(modalId);
	invoiceModal.show()
});

$(document).on('click', ".payInvoice", function() {
	var invoiceId = $(this).attr('data-invoiceId');

	$.post('https://okokBilling/action', JSON.stringify ({
		action: "payInvoice",
		invoice_id: invoiceId,
	}));

	$(".myinvoices").fadeOut();

	setTimeout(function(){
		windowIsOpened = false

		for(var i=0; i<table.length; i++) {
			table[i].destroy();
			table.splice(i, 1);
		}

		$(".modal").remove();
	}, 400);
});

$(document).on('click', ".cancelInvoice", function() {
	var invoiceId = $(this).attr('data-invoiceId');

	$.post('https://okokBilling/action', JSON.stringify ({
		action: "cancelInvoice",
		invoice_id: invoiceId,
	}));

	$(".societyinvoices").fadeOut();

	setTimeout(function(){
		windowIsOpened = false

		for(var i=0; i<table.length; i++) {
			table[i].destroy();
			table.splice(i, 1);
		}

		$(".modal").remove();
	}, 400);
});

$(document).on('click', '#menuMyInvoices', function() {
	windowIsOpened = false
	$(".mainmenu").fadeOut();

	$.post('http://okokBilling/action', JSON.stringify ({
		action: "mainMenuOpenMyInvoices"
	}));
})

$(document).on('click', '#menuSocietyInvoices', function() {
	windowIsOpened = false
	$(".mainmenu").fadeOut();

	$.post('http://okokBilling/action', JSON.stringify ({
		action: "mainMenuOpenSocietyInvoices"
	}));
})

$(document).on('click', '#menuCreateInvoice', function() {
	windowIsOpened = false
	$(".mainmenu").fadeOut();

	$.post('http://okokBilling/action', JSON.stringify ({
		action: "mainMenuOpenCreateInvoice"
	}));
})

$(document).on('click', '#sendInvoice', function() {
	var invoice_value = $("#invoice_value").val();
	var invoice_item = $("#invoice_item").val();
	var invoice_notes = $("#invoice_notes").val();

	if (document.getElementById("invoice_notes").value === "") {
		invoice_notes = "Nothing to add.";
	}

	if(!invoice_value || !invoice_item) {
		$.post('http://okokBilling/action', JSON.stringify({
			action: "missingInfo",
		}));
	} else {
		if(invoice_value >= 0) {
			$(".sendinvoice").fadeOut();
			windowIsOpened = false

			$.post('http://okokBilling/action', JSON.stringify({
				action: "createInvoice",
				target: 0,
				targetName: -1,
				society: "",
				society_name: "",
				invoice_value: invoice_value,
				invoice_item: invoice_item,
				invoice_notes: "Notes: " + invoice_notes
			}));

			setTimeout(function() {
				for(var i=0; i<table.length; i++) {
					table[i].destroy();
					table.splice(i, 1);
				}
				$("#invoice_value").val("");
				$("#invoice_item").val("");
				$("#invoice_notes").val("");
			}, 400);
		} else {
			$.post('http://okokBilling/action', JSON.stringify({
				action: "negativeAmount",
			}));
		}
	}
})

$(document).on('click', "#closeMainMenu", function() {
	var popuprev = new Audio('popupreverse.mp3');
	popuprev.volume = 0.4;
	popuprev.play();

	windowIsOpened = false
	$(".mainmenu").fadeOut();

	$.post('https://okokBilling/action', JSON.stringify({
		action: "close",
	}));
});

$(document).on('click', "#closeSendInvoice", function() {
	var popuprev = new Audio('popupreverse.mp3');
	popuprev.volume = 0.4;
	popuprev.play();

	$(".sendinvoice").fadeOut();

	setTimeout(function() {
		windowIsOpened = false

		for(var i=0; i<table.length; i++) {
			table[i].destroy();
			table.splice(i, 1);
		}

		$("#invoice_value").val("");
		$("#invoice_item").val("");
		$("#invoice_notes").val("");
		$(".modal").remove();
	}, 400);

	$.post('https://okokBilling/action', JSON.stringify({
		action: "close",
	}));
});

$(document).on('click', "#closeSocietyInvoices", function() {
	var popuprev = new Audio('popupreverse.mp3');
	popuprev.volume = 0.4;
	popuprev.play();

	$(".societyinvoices").fadeOut();

	setTimeout(function() {
		windowIsOpened = false

		for(var i=0; i<table.length; i++) {
			table[i].destroy();
			table.splice(i, 1);
		}

		$(".modal").remove();
	}, 400);

	$.post('https://okokBilling/action', JSON.stringify({
		action: "close",
	}));
});

$(document).on('click', "#closeMyInvoices", function() {
	var popuprev = new Audio('popupreverse.mp3');
	popuprev.volume = 0.4;
	popuprev.play();

	$(".myinvoices").fadeOut();

	setTimeout(function() {
		windowIsOpened = false

		for(var i=0; i<table.length; i++) {
			table[i].destroy();
			table.splice(i, 1);
		}

		$(".modal").remove();
	}, 400);

	$.post('https://okokBilling/action', JSON.stringify({
		action: "close",
	}));
});

// Close ESC Key
$(document).ready(function() {
	document.onkeyup = function(data) {
		if (data.which == 27) {
			var popuprev = new Audio('popupreverse.mp3');
			popuprev.volume = 0.4;
			popuprev.play();
			switch (selectedWindow) {
				case 'myinvoices':
					$(".myinvoices").fadeOut();

					setTimeout(function() {
						windowIsOpened = false

						for(var i=0; i<table.length; i++) {
							table[i].destroy();
							table.splice(i, 1);
						}

						$(".modal").remove();
					}, 400);

					$.post('https://okokBilling/action', JSON.stringify({
						action: "close",
					}));
					break
				case 'mainMenu':
					windowIsOpened = false

					$(".mainmenu").fadeOut();

					$.post('https://okokBilling/action', JSON.stringify({
						action: "close",
					}));
					break
				case 'societyinvoices':
					$(".societyinvoices").fadeOut();

				    setTimeout(function() {
						windowIsOpened = false

						for(var i=0; i<table.length; i++) {
							table[i].destroy();
							table.splice(i, 1);
						}

						$(".modal").remove();
					}, 400);

				    $.post('https://okokBilling/action', JSON.stringify({
				        action: "close",
				    }));
					break
				case 'createinvoice':
					$(".sendinvoice").fadeOut();

					setTimeout(function() {
						windowIsOpened = false

						for(var i=0; i<table.length; i++) {
							table[i].destroy();
							table.splice(i, 1);
						}

						$(".modal").remove();
					}, 400);

					$.post('https://okokBilling/action', JSON.stringify({
						action: "close",
					}));
					break
			}
		}
	};
});