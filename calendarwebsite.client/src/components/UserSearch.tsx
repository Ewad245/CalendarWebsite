import { useCombobox } from "downshift";
import { UserInfo } from "../interfaces/type";

interface UserSearchProps {
  userList: UserInfo[];
  selectedUser: UserInfo | null;
  setSelectedUser: (user: UserInfo | null) => void;
  inputValue: string;
  setInputValue: (value: string) => void;
  setEvents: (events: any[]) => void;
}

const normalizeString = (str: string) => {
  if (!str) return "";

  str = str.toLowerCase();

  const charMap: Record<string, string> = {
    à: "a", á: "a", ả: "a", ã: "a", ạ: "a",
    ă: "a", ằ: "a", ắ: "a", ẳ: "a", ẵ: "a", ặ: "a",
    â: "a", ầ: "a", ấ: "a", ẩ: "a", ẫ: "a", ậ: "a",
    đ: "d",
    è: "e", é: "e", ẻ: "e", ẽ: "e", ẹ: "e",
    ê: "e", ề: "e", ế: "e", ể: "e", ễ: "e", ệ: "e",
    ì: "i", í: "i", ỉ: "i", ĩ: "i", ị: "i",
    ò: "o", ó: "o", ỏ: "o", õ: "o", ọ: "o",
    ô: "o", ồ: "o", ố: "o", ổ: "o", ỗ: "o", ộ: "o",
    ơ: "o", ờ: "o", ớ: "o", ở: "o", ỡ: "o", ợ: "o",
    ù: "u", ú: "u", ủ: "u", ũ: "u", ụ: "u",
    ư: "u", ừ: "u", ứ: "u", ử: "u", ữ: "u", ự: "u",
    ỳ: "y", ý: "y", ỷ: "y", ỹ: "y", ỵ: "y",
  };

  return [...str].map((char) => charMap[char] || char).join("");
};

export default function UserSearch({
  userList,
  selectedUser,
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
      <div className="w-full max-w-md mx-auto relative">
        <div>
          <div className="flex gap-2 items-center">
            <input
              {...getInputProps()}
              placeholder="Search for a user"
              className="flex-1 p-2 sm:p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-50 transition-colors duration-200 text-sm sm:text-base"
            />
            {inputValue && (
              <button
                onClick={handleClearSelection}
                className="shrink-0 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-neutral-700 hover:bg-gray-100 dark:hover:bg-neutral-600 cursor-pointer transition-colors text-neutral-900 dark:text-neutral-50 text-sm sm:text-base"
              >
                Clear
              </button>
            )}
          </div>
          <ul
            {...getMenuProps()}
            className={`list-none p-0 m-0 max-h-48 overflow-y-auto absolute bg-white dark:bg-neutral-700 w-full z-10 rounded-lg shadow-lg mt-1 ${
              isOpen && filteredItems.length > 0
                ? "border border-gray-300 dark:border-gray-600"
                : ""
            }`}
          >
            {isOpen &&
              filteredItems.map((item, index) => (
                <li
                  key={item.email}
                  {...getItemProps({ item, index })}
                  className={`p-2 sm:p-3 cursor-pointer text-sm sm:text-base ${
                    highlightedIndex === index
                      ? "bg-gray-100 dark:bg-neutral-600"
                      : "bg-white dark:bg-neutral-700"
                  } ${
                    index < filteredItems.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  } text-neutral-900 dark:text-neutral-50`}
                >
                  {item.fullName} - {item.email}
                </li>
              ))}
            {isOpen && filteredItems.length === 0 && inputValue && (
              <li className="p-2 sm:p-3 text-gray-500 dark:text-gray-300 text-sm sm:text-base">
                No matching users found
              </li>
            )}
          </ul>
        </div>
      </div>
      {selectedUser && (
        <div className="mt-3 text-center">
          <p className="text-sm sm:text-base">
            Selected User: <strong>{selectedUser.fullName}</strong>
          </p>
        </div>
      )}
    </div>
  );
} 