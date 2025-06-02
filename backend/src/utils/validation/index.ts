/**
 * Funções de validação e sanitização
 */

/**
 * Verifica se uma string contém apenas números
 */
  export const isNumeric = (value: string): boolean => {
    return /^-?\d+$/.test(value);
  };
  
  /**
   * Valida CPF ou CNPJ
   */
  export const validaCpfCnpj = (cpfCnpj: string): boolean => {
    // Remove todos os caracteres não numéricos
    const numero = cpfCnpj.replace(/[^\d]/g, '');
    
    // Validação de CPF
    if (numero.length === 11) {
      const cpf = numero.split('').map(Number);
      
      // Verifica se todos os dígitos são iguais
      if (cpf.every(digit => digit === cpf[0])) {
        return false;
      }
      
      // Validação do primeiro dígito verificador
      let v1 = 0;
      for (let i = 0; i < 9; i++) {
        v1 += cpf[i] * (10 - i);
      }
      v1 = ((v1 * 10) % 11);
      if (v1 === 10) v1 = 0;
      if (v1 !== cpf[9]) return false;
      
      // Validação do segundo dígito verificador
      let v2 = 0;
      for (let i = 0; i < 10; i++) {
        v2 += cpf[i] * (11 - i);
      }
      v2 = ((v2 * 10) % 11);
      if (v2 === 10) v2 = 0;
      if (v2 !== cpf[10]) return false;
      
      return true;
    }
    
    // Validação de CNPJ
    if (numero.length === 14) {
      const cnpj = numero.split('').map(Number);
      
      // Verifica se todos os dígitos são iguais
      if (cnpj.every(digit => digit === cnpj[0])) {
        return false;
      }
      
      // Validação do primeiro dígito verificador
      let v1 = 0;
      for (let i = 0; i < 12; i++) {
        v1 += cnpj[i] * (i < 4 ? 5 - i : 13 - i);
      }
      v1 = (v1 % 11);
      v1 = v1 < 2 ? 0 : 11 - v1;
      if (v1 !== cnpj[12]) return false;
      
      // Validação do segundo dígito verificador
      let v2 = 0;
      for (let i = 0; i < 13; i++) {
        v2 += cnpj[i] * (i < 5 ? 6 - i : 14 - i);
      }
      v2 = (v2 % 11);
      v2 = v2 < 2 ? 0 : 11 - v2;
      if (v2 !== cnpj[13]) return false;
      
      return true;
    }
    
    return false;
  };
  
  /**
   * Sanitiza um nome removendo caracteres especiais e limitando o tamanho
   */
  export const sanitizeName = (name: string): string => {
    let sanitized = name.split(" ")[0];
    sanitized = sanitized.replace(/[^a-zA-Z0-9]/g, "");
    return sanitized.substring(0, 60);
  };
  
  /**
   * Mantém apenas caracteres específicos em uma string
   */
  export const keepOnlySpecifiedChars = (str: string): string => {
    return str.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚâêîôûÂÊÎÔÛãõÃÕçÇ!?.,;:\s]/g, "");
  };