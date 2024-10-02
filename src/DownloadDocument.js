import { useRef } from 'react';
import Claim from './Claim'; 
import HtmlDocx from 'html-docx-js/dist/html-docx';

const DownloadDocument = ({ claimProps }) => {
    const claimRef = useRef();

    const downloadWordDocument = () => {
        const claimContent = claimRef.current.innerHTML;

        // Добавляем стили, включая стили для изображения и попытку его повторения на каждой странице
        const style = `
            <style>
                .containerClaim {
                    font-family: "Montserrat", sans-serif;
                    line-height: 1.5;
                    padding: 20px;
                    max-width: 800px;
                    margin: 0 auto;
                    position: relative;
                }

                .header-image {
                    width: 100px;
                    position: absolute;
                    top: 0;
                    left: 0;
                }

                 .container-table, .container-table td {
                    font-family: "Montserrat", sans-serif; /* Обеспечиваем одинаковый шрифт */
                    font-size: 15px; /* Устанавливаем размер шрифта */
                    line-height: 1.5;
                }

                .page-break {
                    page-break-before: always;
                }

                /* Попытка сделать повторяющийся элемент */
                @media print {
                    .header-image {
                        display: block;
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100px;
                    }
                }

                .container-table td {
                    font-size: 15px;
                }

                .container-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 30px;
                }

                .left-indent {
                    text-indent: 40px;
                }

                .align-right {
                    text-align: right;
                }

                .containerClaim h2 {
                    font-size: 15px;
                    margin-bottom: 20px;
                    text-align: center;
                }

                .containerClaim p {
                    margin: 0;
                    text-indent: 40px;
                    text-align: justify;
                    font-size: 15px;
                }
            </style>
        `;

       
        const fullContent = style + claimContent;

        const converted = HtmlDocx.asBlob(fullContent); // Конвертируем HTML в .docx

        // Создаем временный URL для скачивания
        const url = URL.createObjectURL(converted);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Претензия.docx'; // Имя файла для скачивания
        document.body.appendChild(a);
        a.click(); // Имитируем клик для скачивания
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Освобождаем объект URL
    };

    return (
        <div>
            {/* Отображаем невидимый div для содержимого Claim */}
            <div ref={claimRef} style={{ display: 'none' }}>
                {/* Вставляем здесь компонент Claim с пропсами */}
                <Claim {...claimProps} />
            </div>

            {/* Кнопка для скачивания документа */}
            <button onClick={downloadWordDocument}>
                Скачать документ
            </button>
        </div>
    );
};

export default DownloadDocument;