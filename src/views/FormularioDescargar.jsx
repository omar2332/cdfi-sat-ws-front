import React, {  Fragment, useState } from 'react';
import moment from 'moment';
import DateTimePicker from 'react-datetime-picker';
import Spinner from 'react-bootstrap/Spinner'

export const FormularioDescargar = () =>{
    
    const [rfc, setRFC] = useState("");
    const [pass, setpass] = useState("");
    const [certificado,setcertificado] = useState("")
    const [key,setKey] = useState("")
    const [fechaInicio,setFechaInicio] = useState(new Date())
    const [fechaFin,setFechaFin] = useState(new Date())
    const [cargando,setCargando] = useState(false)
    const [error,setError] = useState([])


    
    function handleApplyFechaInicio(event) {
        setFechaInicio(event)
    }

    function handleApplyFechaFin(event) {
        setFechaFin(event)
    }

    const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });


    async function handleCertificado(event){
        setError([])
        let base64 = await toBase64(event.target.files[0])
        if(event.target.files[0].name.split(".")[1]!=="cer"){
            setError([...error,"certificado, archivo incorrecto, debe ser de tipo .cer"])
            event.target.value = null;
        }else{
            setcertificado(base64.split(",")[1])
        }

        
    }
    
    async function handleKey(event){
        setError([])
        let base64 = await toBase64(event.target.files[0])
        if(event.target.files[0].name.split(".")[1]!=="key"){
            setError([...error,"key, archivo incorrecto, debe ser de tipo .key"])
            event.target.value = null;
        }else{
            setError([])
            setKey(base64.split(",")[1])
        }
        
    }
    
    async function download(){
        setCargando(true)
        const axios = require('axios');
        let body = {
            rfc_req:rfc,
            pass_req:pass,
            fechaInicio: moment(fechaInicio).format('DD/MM/YYYY HH:mm:ss'),
            fechaFin:  moment(fechaFin).format('DD/MM/YYYY HH:mm:ss'),
            key_req: key,
            cer_req: certificado
            }

            try{
                await axios({
                    url: 'https://cdfi-sat-ws-back.herokuapp.com/login', //your url
                    //url: 'http://127.0.0.1:5000/login', //your url
                    method: 'POST',
                    responseType: 'blob', // important
                    data:body
                }).then((response) => {
                    const url = window.URL.createObjectURL(new Blob([response.data]));
                    const link = document.createElement('a');
                    link.href = url;
                    link.setAttribute('download', `${rfc}.xlsx`); //or any other extension
                    document.body.appendChild(link);
                    link.click();
                    setCargando(false)
                    setError([])
                })

            }catch(error){
                setCargando(false)
                setError(["Ha ocurrido un error inesperado, vuelve a intentarlo con otros parametros de fecha, o reinicia la pagina"])
            }   
            
    }


    return(
        <div className="container">
            <h1> SISTEMA PARA DESCARGAR CDFI </h1>

            <p> Rellene los campos con las informacion necesaria</p>
            {
                error.length !== 0 ? 
                error.map((texto,index)=>{
                    return <p className='text-danger' key={"error"+index}>
                        {texto}
                    </p>
                })
                :
                ""
            }
            <form method='POST'>
                <div className="mb-3">
                    <label htmlFor="rfc_data" className="form-label">RFC</label>
                    <input type="text" className="form-control" id="rfc_data" placeholder="XXXX0000XXXXX0" value={rfc} onChange={(e)=>setRFC(e.target.value)} required/>
                </div>

                <div className="mb-3">
                    <p>Fecha Inicio Intervalo</p>
                    <DateTimePicker
                        value={fechaInicio}
                        onChange={handleApplyFechaInicio}
                        format="dd/MM/yyyy hh:mm:ss"
                        maxDetail= "second"
                        required
                    />

                </div>

                <div className="mb-3">
                    <p>Fecha Fin Intervalo</p>
                    <DateTimePicker
                        value={fechaFin}
                        onChange={handleApplyFechaFin}
                        format="dd/MM/yyyy hh:mm:ss"
                        maxDetail= "second"
                        required
                    />

                </div>

                <div className="mb-3">
                    <label htmlFor="inputkey" className="form-label">Key</label>
                    <input type="file" className="form-control" id="inputkey"  onChange={handleKey} required/>
                </div>

                <div className="mb-3">
                    <label htmlFor="inputcert" className="form-label">Certificado</label>
                    <input type="file" className="form-control" id="inputcert" onChange={handleCertificado} required/>
                </div>

                <div className="mb-3">
                    <label htmlFor="inputpassword" className="form-label">Contrase??a</label>
                    <input type="password" className="form-control" id="inputpassword" placeholder="XXXX0000XXXXX0" value={pass} onChange={(e)=>setpass(e.target.value)} required/>
                </div>

                <div className="mb-3 align-center">
                    <button className='btn btn-primary' type='submit' onClick={download} disabled={cargando}>
                        
                        {
                            cargando ? 
                            <Fragment> 
                                <Spinner
                                    as="span"
                                    animation="grow"
                                    size="sm"
                                    role="status"
                                    aria-hidden="true"
                                    />
                                Loading...

                            </Fragment>
                            :  
                            <Fragment> 
                                Enviar
                            </Fragment>
                        }
                    </button>
                </div>
                
            </form>
        </div>
    )
}

export default FormularioDescargar;