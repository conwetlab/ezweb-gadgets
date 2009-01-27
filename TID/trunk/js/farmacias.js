var Direccion = EzWebAPI.createRWGadgetVariable("address");

function enviar_evento(valor)
{
	set_address(valor);

	//alert("Evento: " + valor);
}

function set_address(valor)
{
	Direccion.set(valor);
}

