import { useCombobox } from "downshift";
import { UserInfo } from "../interfaces/type";
import { Input } from "./ui/input";
import { Card, CardContent } from "./ui/card";
import { Search, X } from "lucide-react";
import { Avatar } from "./ui/avatar";
import { Separator } from "./ui/separator";
import ExcelExportButton from "./ExcelExportButton";
import { useTranslation } from "react-i18next";

interface UserSearchProps {
  userList: UserInfo[];
  selectedUser: UserInfo | null;
  selectedDate?: Date | null;
  setSelectedUser: (user: UserInfo | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  setEvents: (events: any[]) => void;
}


const normalizeString = (str: string) => {
  if (!str) return "";

  str = str.toLowerCase();

  const charMap: Record<string, string> = {
    à: "a",
    á: "a",
    ả: "a",
    ã: "a",
    ạ: "a",
    ă: "a",
    ằ: "a",
    ắ: "a",
    ẳ: "a",
    ẵ: "a",
    ặ: "a",
    â: "a",
    ầ: "a",
    ấ: "a",
    ẩ: "a",
    ẫ: "a",
    ậ: "a",
    đ: "d",
    è: "e",
    é: "e",
    ẻ: "e",
    ẽ: "e",
    ẹ: "e",
    ê: "e",
    ề: "e",
    ế: "e",
    ể: "e",
    ễ: "e",
    ệ: "e",
    ì: "i",
    í: "i",
    ỉ: "i",
    ĩ: "i",
    ị: "i",
    ò: "o",
    ó: "o",
    ỏ: "o",
    õ: "o",
    ọ: "o",
    ô: "o",
    ồ: "o",
    ố: "o",
    ổ: "o",
    ỗ: "o",
    ộ: "o",
    ơ: "o",
    ờ: "o",
    ớ: "o",
    ở: "o",
    ỡ: "o",
    ợ: "o",
    ù: "u",
    ú: "u",
    ủ: "u",
    ũ: "u",
    ụ: "u",
    ư: "u",
    ừ: "u",
    ứ: "u",
    ử: "u",
    ữ: "u",
    ự: "u",
    ỳ: "y",
    ý: "y",
    ỷ: "y",
    ỹ: "y",
    ỵ: "y",
  };

  return [...str].map((char) => charMap[char] || char).join("");
};

export default function UserSearch({
  userList,
  selectedUser,
  selectedDate,
  setSelectedUser,
  inputValue,
  setInputValue,
  setEvents,
}: UserSearchProps) {
  const getFilteredItems = (inputValue: string) => {
    if (!inputValue) return userList;

    const normalizedInput = normalizeString(inputValue);

    return userList.filter((user) => {
      if (!user.fullName) return false;

      const normalizedName = normalizeString(user.fullName);

      return (
        user.fullName.toLowerCase().includes(inputValue.toLowerCase()) ||
        normalizedName.includes(normalizedInput) ||
        user.email.toLowerCase().includes(inputValue.toLowerCase())
      );
    });
  };
  const { t } = useTranslation();

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    highlightedIndex,
    reset,
  } = useCombobox({
    items: getFilteredItems(inputValue),
    inputValue,
    onInputValueChange: ({ inputValue }) => {
      setInputValue(inputValue || "");
    },
    onSelectedItemChange: ({ selectedItem }) => {
      if (selectedItem) {
        setSelectedUser(selectedItem);
        setInputValue(selectedItem.fullName || "");
      }
    },
    itemToString: (item) => (item ? item.fullName || "" : ""),
  });

  const handleClearSelection = () => {
    setSelectedUser(null);
    setInputValue("");
    setEvents([]);
    reset();
  };

  const filteredItems = getFilteredItems(inputValue);

  return (
    <div className="mb-5">
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="relative">
            <div className="flex gap-2 items-center">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...getInputProps()}
                  placeholder={t('attendance.filters.selectUser')}
                  className="pl-9 pr-9 w-full"
                />
                {inputValue && (
                  <button
                    type="button"
                    onClick={handleClearSelection}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 bg-gray-300 dark:bg-gray-600 rounded-full hover:bg-gray-400 dark:hover:bg-gray-500 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    aria-label="Clear search"
                  >
                    <X className="absolute h-3.5 w-3.5 text-gray-800 dark:text-gray-100" />
                  </button>
                )}
              </div>
            </div>
            <div
              {...getMenuProps()}
              className={`mt-1 w-full z-10 ${
                isOpen && filteredItems.length > 0 ? "" : "hidden"
              }`}
            >
              <Card className="overflow-hidden p-0 mt-1">
                <div className="max-h-48 overflow-y-auto">
                  {isOpen &&
                    filteredItems.map((item, index) => (
                      <div
                        key={item.email}
                        {...getItemProps({ item, index })}
                        className={`p-2 cursor-pointer flex items-center gap-3 ${
                          highlightedIndex === index ? "bg-muted" : "bg-card"
                        }`}
                      >
                        <Avatar className="h-8 w-8">
                          <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium">
                            {item.fullName?.charAt(0) || "U"}
                          </div>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">{item.fullName}</span>
                          <span className="text-sm text-muted-foreground">
                            {item.email}
                          </span>
                        </div>
                      </div>
                    ))}
                  {isOpen && filteredItems.length === 0 && inputValue && (
                    <div className="p-3 text-muted-foreground text-sm">
                      {t('common.loading')}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
          {selectedUser && (
            <div className="mt-4">
              <Separator className="my-2" />
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <div className="bg-primary text-primary-foreground rounded-full h-full w-full flex items-center justify-center text-sm font-medium">
                      {selectedUser.fullName?.charAt(0) || "U"}
                    </div>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{selectedUser.fullName}</span>
                    <span className="text-sm text-muted-foreground">
                      {selectedUser.email}
                    </span>
                  </div>
                </div>
                <div>
                  <ExcelExportButton userData={selectedUser} />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
