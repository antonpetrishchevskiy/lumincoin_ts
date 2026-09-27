export class GetDataUtils {
    public static getData(data: Date | null = null): string {
        const dataElement = data ? data : new Date();
        const year = dataElement.getFullYear();
        const month = addZeroData(dataElement.getMonth() + 1);
        const day = addZeroData(dataElement.getDate());
        return (`${year}-${month}-${day}`);

        function addZeroData(dataElement: number) {
            if(dataElement < 10) {
                return '0' + dataElement;
            }
            return dataElement.toString();
        }
    }
}