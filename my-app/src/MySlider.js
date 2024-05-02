import  
function MySlider(){
    const [value , setvalue]


    return(
        <input 
            type = "range"
            width = "300"
            min = "0"
            max = "255"
            value = {value}
        />
    );
}