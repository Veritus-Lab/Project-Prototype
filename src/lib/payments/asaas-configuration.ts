import "server-only";
export function getAsaasConfiguration(){const configured=Boolean(process.env.ASAAS_API_KEY&&process.env.ASAAS_ENVIRONMENT==='sandbox');return{configured,reason:configured?null:'Aguardando a contratação e as credenciais sandbox do Asaas pela FLERNK.'}as const;}
